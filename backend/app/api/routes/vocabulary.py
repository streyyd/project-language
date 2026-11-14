from fastapi import APIRouter, HTTPException, status

from app.api.schemas.vocabulary import (
    VocabularyEnrichmentRequest,
    VocabularyEnrichmentResult,
)
from app.services.gemini import (
    GeminiConfigurationError,
    GeminiResponseValidationError,
    GeminiServiceError,
    enrich_vocabulary,
)

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.post(
    "/enrich",
    response_model=VocabularyEnrichmentResult,
)
def enrich_vocabulary_endpoint(
    request: VocabularyEnrichmentRequest,
) -> VocabularyEnrichmentResult:
    try:
        return enrich_vocabulary(request.term, request.target_language)
    except GeminiConfigurationError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error
    except GeminiResponseValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error
    except GeminiServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error
