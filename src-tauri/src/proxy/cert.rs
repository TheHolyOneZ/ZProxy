use rcgen::{
    BasicConstraints, Certificate, CertificateParams, DistinguishedName, DnType, IsCa, KeyPair,
};
use std::path::{Path, PathBuf};

pub struct CaContext {
    pub cert_der: Vec<u8>,
    pub key_der: Vec<u8>,
    pub cert_path: PathBuf,
}

pub fn ca_paths(app_data_dir: &Path) -> (PathBuf, PathBuf, PathBuf, PathBuf) {
    (
        app_data_dir.join("zproxy_ca.pem"),
        app_data_dir.join("zproxy_ca_key.pem"),
        app_data_dir.join("zproxy_ca.der"),
        app_data_dir.join("zproxy_ca_key.der"),
    )
}

fn build_ca_cert(key_pem: &str) -> Result<Certificate, String> {
    let key_pair = KeyPair::from_pem(key_pem).map_err(|e| e.to_string())?;

    let mut params = CertificateParams::default();
    params.is_ca = IsCa::Ca(BasicConstraints::Unconstrained);
    params.key_pair = Some(key_pair);
    params.serial_number = Some(rcgen::SerialNumber::from(vec![1u8]));
    params.not_before = rcgen::date_time_ymd(2024, 1, 1);
    params.not_after = rcgen::date_time_ymd(2034, 1, 1);

    let mut dn = DistinguishedName::new();
    dn.push(DnType::CommonName, "ZProxy Root CA");
    dn.push(DnType::OrganizationName, "ZProxy");
    params.distinguished_name = dn;

    Certificate::from_params(params).map_err(|e| e.to_string())
}

pub fn load_or_create_ca(app_data_dir: &Path) -> Result<CaContext, String> {
    let (cert_pem_path, key_pem_path, cert_der_path, key_der_path) = ca_paths(app_data_dir);

    std::fs::create_dir_all(app_data_dir).map_err(|e| e.to_string())?;

    if cert_der_path.exists() && key_der_path.exists() && cert_pem_path.exists() {
        let cert_der = std::fs::read(&cert_der_path).map_err(|e| e.to_string())?;
        let key_der = std::fs::read(&key_der_path).map_err(|e| e.to_string())?;
        return Ok(CaContext { cert_der, key_der, cert_path: cert_pem_path });
    }

    let key_pair = KeyPair::generate(&rcgen::PKCS_ECDSA_P256_SHA256).map_err(|e| e.to_string())?;
    let key_pem = key_pair.serialize_pem();

    let cert = build_ca_cert(&key_pem)?;
    let cert_pem = cert.serialize_pem().map_err(|e| e.to_string())?;
    let cert_der = cert.serialize_der().map_err(|e| e.to_string())?;
    let key_der = cert.serialize_private_key_der();

    std::fs::write(&cert_pem_path, &cert_pem).map_err(|e| e.to_string())?;
    std::fs::write(&key_pem_path, &key_pem).map_err(|e| e.to_string())?;
    std::fs::write(&cert_der_path, &cert_der).map_err(|e| e.to_string())?;
    std::fs::write(&key_der_path, &key_der).map_err(|e| e.to_string())?;

    Ok(CaContext { cert_der, key_der, cert_path: cert_pem_path })
}

pub fn ca_cert_pem_path(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("zproxy_ca.pem")
}

pub fn install_ca_windows(cert_path: &Path) -> Result<(), String> {
    let path_str = cert_path.to_string_lossy().to_string();
    let output = std::process::Command::new("certutil")
        .args(["-addstore", "Root", &path_str])
        .output()
        .map_err(|e| format!("Failed to run certutil: {e}"))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("certutil failed: {stderr}"))
    }
}
