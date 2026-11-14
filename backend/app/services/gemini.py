import logging
from copy import deepcopy
from time import perf_counter
from typing import Any

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import ValidationError

from app.api.schemas.vocabulary import VocabularyEnrichmentResult
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiConfigurationError(Exception):
    pass


class GeminiServiceError(Exception):
    pass


class GeminiResponseValidationError(Exception):
    pass


def _classify_api_error(error: genai_errors.APIError) -> str:
    if error.code in {401, 403}:
        return "authentication/api_key"
    if error.code == 429:
        return "quota/rate_limit"
    if error.code in {400, 422}:
        return "invalid_request/schema"
    if error.code == 404:
        return "model_unavailable"
    if 500 <= error.code < 600:
        return "provider/server"
    return "sdk_api_error"


def _is_network_or_timeout_error(error: Exception) -> bool:
    error_name = type(error).__name__.lower()
    error_module = type(error).__module__.lower()
    return (
        isinstance(error, (TimeoutError, OSError))
        or "timeout" in error_name
        or "connect" in error_name
        or error_module.startswith(("httpx", "httpcore"))
    )


def _log_gemini_exception(
    category: str,
    error: Exception,
    duration_seconds: float,
) -> None:
    safe_message = "Gemini SDK exception details omitted from client response."
    if isinstance(error, genai_errors.APIError):
        logger.exception(
            "Gemini request failed model=%s duration_seconds=%.3f "
            "category=%s error_type=%s status_code=%s provider_status=%s: %s",
            settings.gemini_model,
            duration_seconds,
            category,
            type(error).__name__,
            error.code,
            error.status,
            safe_message,
        )
        return

    logger.exception(
        "Gemini request failed model=%s duration_seconds=%.3f category=%s "
        "error_type=%s: %s",
        settings.gemini_model,
        duration_seconds,
        category,
        type(error).__name__,
        safe_message,
    )


def _log_usage_metadata(response: Any, duration_seconds: float) -> None:
    usage_metadata = getattr(response, "usage_metadata", None)
    if usage_metadata is None:
        logger.info(
            "Gemini request completed model=%s duration_seconds=%.3f "
            "status_code=%s usage_metadata=unavailable",
            settings.gemini_model,
            duration_seconds,
            getattr(response, "status_code", None),
        )
        return

    logger.info(
        "Gemini request completed model=%s duration_seconds=%.3f "
        "status_code=%s input_tokens=%s output_tokens=%s thinking_tokens=%s",
        settings.gemini_model,
        duration_seconds,
        getattr(response, "status_code", None),
        getattr(usage_metadata, "prompt_token_count", None),
        getattr(usage_metadata, "candidates_token_count", None),
        getattr(usage_metadata, "thoughts_token_count", None),
    )


def _build_prompt(term: str, target_language: str) -> str:
    return f"""
Enrich the Japanese word or expression below.

Term: {term}
Target language for all explanations, translations, and examples: {target_language}

Rules:
- Return only data matching the provided JSON schema. Do not add fields.
- Copy term exactly from the input. Do not replace, normalize, or silently
  correct it.
- For an unambiguous Japanese word, always provide its correct hiragana or
  katakana reading and romaji. Never return null when the reading is reliably
  determinable.
- If the term is ambiguous, choose its most common meaning and reading when no
  context is provided. If no reading can be determined reliably, return null
  and explain the uncertainty.
- Include only common, practically useful translations that fit the part of
  speech and ordinary usage. Do not add rare meanings just to increase count.
- Distinguish nouns, verbs, i-adjectives, na-adjectives, adverbs, and other
  Japanese categories. Note noun-plus-suru usage when relevant.
- Explain the core meaning and typical context briefly in the target language.
  For a polysemous term, state that it has multiple meanings instead of
  presenting one meaning as universally exclusive.
- Generate exactly two natural, practical Japanese sentences. Both sentences
  must use the requested term in the appropriate grammatical form; do not make
  artificial sentences merely to include it.
- The reading of each example must cover the entire Japanese sentence, and its
  translation must accurately convey that sentence.
- Set jlpt_level to null when the level is unknown, disputed, or uncertain.
  Never guess a JLPT level.
""".strip()


def _build_gemini_response_schema() -> dict[str, Any]:
    schema = deepcopy(VocabularyEnrichmentResult.model_json_schema())

    def remove_unsupported_fields(value: Any) -> None:
        if isinstance(value, dict):
            value.pop("additionalProperties", None)
            for nested_value in value.values():
                remove_unsupported_fields(nested_value)
        elif isinstance(value, list):
            for nested_value in value:
                remove_unsupported_fields(nested_value)

    remove_unsupported_fields(schema)
    return schema


def _validate_response_quality(
    term: str,
    result: VocabularyEnrichmentResult,
) -> None:
    if result.term != term:
        logger.error(
            "Gemini response term mismatch category=invalid_response/schema"
        )
        raise GeminiResponseValidationError(
            "Gemini returned a term that does not match the requested term."
        )

    if len(result.examples) != 2:
        raise GeminiResponseValidationError(
            "Gemini returned an invalid number of examples."
        )

    for example in result.examples:
        if not all(
            value.strip()
            for value in (
                example.sentence,
                example.reading,
                example.translation,
            )
        ):
            raise GeminiResponseValidationError(
                "Gemini returned an incomplete example."
            )

    missing_term_examples = [
        index + 1
        for index, example in enumerate(result.examples)
        if term not in example.sentence
    ]
    if missing_term_examples:
        logger.warning(
            "Gemini example quality warning term=%s examples_without_exact_term=%s "
            "category=quality_warning",
            term,
            missing_term_examples,
        )

    if result.reading is None or not result.reading.strip():
        logger.warning(
            "Gemini reading quality warning term=%s category=quality_warning",
            term,
        )


def enrich_vocabulary(term: str, target_language: str) -> VocabularyEnrichmentResult:
    if not settings.gemini_api_key:
        raise GeminiConfigurationError(
            "GEMINI_API_KEY is not configured on the backend."
        )

    request_started = perf_counter()
    try:
        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=_build_prompt(term, target_language),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=_build_gemini_response_schema(),
                thinking_config=types.ThinkingConfig(thinking_level="MINIMAL"),
            ),
        )
    except genai_errors.APIError as error:
        _log_gemini_exception(
            _classify_api_error(error),
            error,
            perf_counter() - request_started,
        )
        raise GeminiServiceError(
            "Gemini enrichment request failed."
        ) from error
    except Exception as error:
        category = "network/timeout" if _is_network_or_timeout_error(error) else "other_sdk_error"
        _log_gemini_exception(
            category,
            error,
            perf_counter() - request_started,
        )
        raise GeminiServiceError(
            "Gemini enrichment request failed."
        ) from error

    _log_usage_metadata(response, perf_counter() - request_started)

    if not response.text:
        logger.error(
            "Gemini request returned an empty response category=invalid_response"
        )
        raise GeminiResponseValidationError(
            "Gemini returned an empty enrichment response."
        )

    try:
        result = VocabularyEnrichmentResult.model_validate_json(response.text)
    except (ValidationError, ValueError) as error:
        _log_gemini_exception("invalid_response/schema", error)
        raise GeminiResponseValidationError(
            "Gemini returned data that does not match the enrichment schema."
        ) from error

    _validate_response_quality(term, result)

    return result
