# hobbies/utils_culture.py

import requests
import xml.etree.ElementTree as ET # KOPIS는 XML을 주기 때문에 이게 필요합니다!
from datetime import datetime, timedelta

# ==========================================
# 1. KOPIS API 키 설정
# ==========================================
KOPIS_API_KEY = "5b49299659f94940984185b5e256e02d"

def search_performances(start_date, end_date, keyword=None):
    """
    start_date, end_date: '20260101' 형식 (YYYYMMDD)
    """
    # KOPIS 공연 목록 조회 API URL
    url = "http://www.kopis.or.kr/openApi/restful/pblprfr"
    
    params = {
        'service': KOPIS_API_KEY,
        'stdate': start_date,  # 시작일
        'eddate': end_date,    # 종료일
        'cpage': 1,            # 페이지 번호
        'rows': 10,            # 가져올 개수
        'shprfnm': keyword     # (선택) 공연명 검색
    }
    
    try:
        response = requests.get(url, params=params)
        
        # XML 데이터를 파이썬에서 쓰기 좋게 변환 (Parsing)
        root = ET.fromstring(response.content)
        
        results = []
        for db in root.findall('db'):
            item = {
                'id': db.find('mt20id').text,        # 공연 ID
                'name': db.find('prfnm').text,       # 공연명
                'start': db.find('prfpdfrom').text,  # 시작일
                'end': db.find('prfpdto').text,      # 종료일
                'place': db.find('fcltynm').text,    # 공연장
                'image': db.find('poster').text,     # 포스터 URL
                'type': db.find('genrenm').text      # 장르 (뮤지컬, 연극 등)
            }
            results.append(item)
            
        return results

    except Exception as e:
        print(f"KOPIS API Error: {e}")
        return []