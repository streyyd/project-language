from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class VocabularyEnrichmentRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    term: str = Field(min_length=1)
    target_language: str = Field(default="ru", min_length=2)


class VocabularyExample(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sentence: str
    reading: str
    translation: str


class VocabularyEnrichmentResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    term: str
    reading: str | None
    romaji: str | None
    translations: list[str] = Field(min_length=1)
    part_of_speech: str
    explanation: str
    examples: list[VocabularyExample] = Field(min_length=2, max_length=2)
    jlpt_level: Literal["N5", "N4", "N3", "N2", "N1"] | None = None
