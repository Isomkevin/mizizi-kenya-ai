from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8080
    masumi_mode: str = "demo"  # demo | live
    payment_service_url: str = "http://localhost:3001/api/v1"
    payment_api_key: str = ""
    mizizi_callback_url: str = "http://host.docker.internal:5173"
    mizizi_callback_secret: str = "mizizi-dev-callback-secret"
    open_meteo_base: str = "https://api.open-meteo.com/v1/forecast"
    agent_fee_lovelace: int = 2_000_000  # ~2 ADA demo pricing


settings = Settings()
