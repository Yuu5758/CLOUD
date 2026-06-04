// Copyright 2024 RustFS Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use crate::admin::router::Operation;
use argon2::{
    password_hash::{phc::PasswordHash, PasswordVerifier},
    Argon2,
};
use http::{HeaderMap, HeaderValue, StatusCode};
use matchit::Params;
use rand::RngExt;
use s3s::header::CONTENT_TYPE;
use s3s::{Body, S3Request, S3Response, S3Result, s3_error};
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;
use subtle::ConstantTimeEq;
use tracing::{error, warn};

static JWT_SECRET: OnceLock<Vec<u8>> = OnceLock::new();

fn get_jwt_secret() -> &'static [u8] {
    JWT_SECRET.get_or_init(|| {
        std::env::var("RUSTFS_CONSOLE_JWT_SECRET")
            .map(|s| s.into_bytes())
            .unwrap_or_else(|_| {
                warn!("RUSTFS_CONSOLE_JWT_SECRET is not set! Generating a random secret. Sessions will be invalidated on server restart.");
                let mut rng = rand::rng();
                let mut bytes = vec![0u8; 32];
                rng.fill(&mut bytes);
                bytes
            })
    })
}

fn verify_password(hash_or_plain: &str, password_attempt: &str) -> bool {
    if hash_or_plain.starts_with("$argon2") {
        if let Ok(parsed_hash) = PasswordHash::new(hash_or_plain) {
            return Argon2::default().verify_password(password_attempt.as_bytes(), &parsed_hash).is_ok();
        }
    }
    hash_or_plain.as_bytes().ct_eq(password_attempt.as_bytes()).into()
}

#[derive(Deserialize, Debug, Default)]
struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
}

#[derive(Debug, Serialize)]
struct LoginResponse {
    token: String,
    username: String,
    role: String,
}

pub struct AdminLoginHandler {}

#[async_trait::async_trait]
impl Operation for AdminLoginHandler {
    async fn call(&self, req: S3Request<Body>, _params: Params<'_, '_>) -> S3Result<S3Response<(StatusCode, Body)>> {
        let mut input = req.input;
        let bytes = match input.store_all_limited(4096).await {
            Ok(b) => b,
            Err(e) => {
                warn!("get body failed, e: {:?}", e);
                return Err(s3_error!(InvalidRequest, "Request body too large or failed to read"));
            }
        };

        let body: LoginRequest = serde_json::from_slice(&bytes)
            .map_err(|_| s3_error!(InvalidRequest, "Invalid JSON format"))?;

        let config_user = std::env::var("RUSTFS_CONSOLE_ADMIN_USER").unwrap_or_else(|_| "Admin".to_string());
        let config_password = std::env::var("RUSTFS_CONSOLE_ADMIN_PASSWORD").unwrap_or_else(|_| "Laskar57".to_string());

        if body.username == config_user && verify_password(&config_password, &body.password) {
            let exp = (time::OffsetDateTime::now_utc().unix_timestamp() + 86400) as usize;
            let claims = Claims {
                sub: body.username.clone(),
                role: "admin".to_string(),
                exp,
            };

            let token = match jsonwebtoken::encode(
                &jsonwebtoken::Header::default(),
                &claims,
                &jsonwebtoken::EncodingKey::from_secret(get_jwt_secret()),
            ) {
                Ok(t) => t,
                Err(e) => {
                    error!("JWT encoding failed: {:?}", e);
                    return Err(s3_error!(InternalError, "Failed to generate token"));
                }
            };

            let response = LoginResponse {
                token,
                username: body.username,
                role: "admin".to_string(),
            };

            let data = serde_json::to_vec(&response)
                .map_err(|_| s3_error!(InternalError, "Failed to serialize response"))?;

            let mut header = HeaderMap::new();
            header.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

            Ok(S3Response::with_headers((StatusCode::OK, Body::from(data)), header))
        } else {
            Err(s3_error!(AccessDenied, "Invalid username or password"))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_password_plaintext() {
        assert!(verify_password("Laskar57", "Laskar57"));
        assert!(!verify_password("Laskar57", "wrongpassword"));
    }

    #[test]
    fn test_verify_password_argon2() {
        use argon2::{
            password_hash::PasswordHasher,
            Argon2,
        };

        let password = "Laskar57";
        let argon2 = Argon2::default();
        let hash = argon2.hash_password(password.as_bytes())
            .expect("Failed to hash password")
            .to_string();

        // Let's assert that our verify_password function successfully verifies this hash
        assert!(verify_password(&hash, "Laskar57"));
        assert!(!verify_password(&hash, "wrongpassword"));
    }

    #[test]
    fn test_jwt_encode_decode() {
        let claims = Claims {
            sub: "Admin".to_string(),
            role: "admin".to_string(),
            exp: (time::OffsetDateTime::now_utc().unix_timestamp() + 3600) as usize,
        };

        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(get_jwt_secret()),
        )
        .expect("JWT encode failed");

        let validation = jsonwebtoken::Validation::new(jsonwebtoken::Algorithm::HS256);
        let decoded = jsonwebtoken::decode::<Claims>(
            &token,
            &jsonwebtoken::DecodingKey::from_secret(get_jwt_secret()),
            &validation,
        )
        .expect("JWT decode failed");

        assert_eq!(decoded.claims.sub, "Admin");
        assert_eq!(decoded.claims.role, "admin");
    }
}
