// client/src/config.ts

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 1. 백엔드 주소 (API 요청용)
const BACKEND_URL = isLocal
  ? 'http://127.0.0.1:8000'
  : 'http://54.180.118.183.nip.io:8000';

// 2. 프론트엔드 주소 (소셜 로그인 리다이렉트용)
const FRONTEND_URL = isLocal
  ? 'http://127.0.0.1:5173'
  : 'http://54.180.118.183.nip.io:5173';

export { BACKEND_URL, FRONTEND_URL };
export default BACKEND_URL; // 기본은 백엔드 주소