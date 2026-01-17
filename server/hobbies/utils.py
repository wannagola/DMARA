import requests
import base64
from ytmusicapi import YTMusic

# ==========================================
# 1. 여기에 발급받은 키를 넣으세요!
# ==========================================
TMDB_API_KEY = "768ac0bb22bfc1cee7d2cc7a9e682be6"

SPORTS_API_KEY = "9c5932efc8bcdc57dc6dfb6193fce3d5"

SPORTS_HEADERS = {
    "x-apisports-key": SPORTS_API_KEY
}

# ==========================================
# 2. TMDB (영화, 드라마, 배우) 검색 함수
# ==========================================
def search_tmdb(query, category):
    base_url = "https://api.themoviedb.org/3/search/"
    image_base_url = "https://image.tmdb.org/t/p/w500"
    
    # 카테고리별 엔드포인트 설정
    if category == 'ACTOR':
        url = base_url + "person"
    elif category == 'MOVIE':
        url = base_url + "movie"
    elif category == 'DRAMA' or category == 'OTT':
        url = base_url + "tv"
    else:
        return []

    # 검색을 수행하는 내부 함수
    def fetch_from_tmdb(lang):
        params = {
            "api_key": TMDB_API_KEY,
            "query": query,
            "language": lang, # 언어 설정 (ko-KR 또는 en-US)
            "page": 1,
            "include_adult": "false"
        }
        try:
            return requests.get(url, params=params).json().get('results', [])
        except:
            return []

    # 1. 영어로 먼저 검색 (Base 데이터)
    results_en = fetch_from_tmdb("en-US")
    
    # 2. 한국어로 검색 (Overlay 데이터)
    results_ko = fetch_from_tmdb("ko-KR")

    # 3. 데이터 병합 (Dictionary를 사용해 ID 기준으로 중복 제거)
    # 영어 결과를 먼저 넣고, 한국어 결과가 있으면 덮어씌웁니다.
    merged_results = {}

    # (1) 영어 결과 먼저 저장
    for item in results_en:
        item['lang_source'] = 'en' # 출처 표시
        merged_results[item['id']] = item

    # (2) 한국어 결과 덮어씌우기 (같은 ID가 있으면 한국어 내용으로 교체됨)
    for item in results_ko:
        item['lang_source'] = 'ko'
        merged_results[item['id']] = item

    # 4. 최종 리스트 변환 및 포맷팅
    final_list = []
    
    # 딕셔너리의 값들만 뽑아서 정리
    for item in merged_results.values():
        # 이미지 주소 완성
        image_path = item.get('poster_path') or item.get('profile_path')
        full_image_url = image_base_url + image_path if image_path else None

        # 제목/이름
        title = item.get('title') or item.get('name')
        
        # 설명 (한국어 결과에 설명이 비어있으면, 영어 원문 설명이라도 넣기 위한 처리)
        overview = item.get('overview') or ""
        
        # 배우의 경우 출연작 정보
        if category == 'ACTOR':
            known_works = [w.get('title') or w.get('name') for w in item.get('known_for', [])]
            desc = ", ".join([w for w in known_works if w])
        else:
            # 영화/드라마는 개봉일 + 줄거리 약간
            date = item.get('release_date') or item.get('first_air_date') or ""
            desc = f"({date[:4]}) {overview[:50]}..." if date else overview[:50]

        final_list.append({
            "id": f"{category}_{item.get('id')}",
            "name": title,
            "subtitle": item.get('original_title') or item.get('original_name'), # 원제(영어제목)도 같이 저장!
            "image": full_image_url,
            "type": category,
            "desc": desc
        })

    # 인기도 순으로 다시 정렬 (합치다 보면 순서가 섞일 수 있어서)
    # popularity 키가 없는 경우 0 처리
    final_list.sort(key=lambda x: merged_results[int(x['id'].split('_')[1])].get('popularity', 0), reverse=True)

    return final_list

# ==========================================
# [NEW] 유튜브 뮤직에서 아티스트 검색 함수
# ==========================================
def search_youtube_music_artist(query):
    yt = YTMusic()
    # filter='artists'를 쓰면 노래 말고 '가수'만 딱 검색해줍니다.
    search_results = yt.search(query, filter='artists')
    
    results = []
    for item in search_results[:5]: # 상위 5명만
        try:
            # 썸네일 중 가장 고화질 가져오기 (마지막 항목이 보통 제일 큼)
            image_url = item['thumbnails'][-1]['url'] if item.get('thumbnails') else None

            results.append({
                "id": f"ARTIST_{item['browseId']}", # 고유 ID
                "name": item['artist'],             # 가수 이름 (NewJeans)
                "subtitle": "Artist",               # 구분
                "image": image_url,                 # ★ 유튜브 뮤직의 그 고화질 프사!
                "type": "IDOL",                     # 카테고리
            })
        except Exception as e:
            continue
            
    return results

# ==========================================
# 3. 음악/아이돌 통합 검색 (iTunes + YouTube Music)
# ==========================================
def search_spotify(query, category):
    # -----------------------------------------------
    # CASE A: 아이돌/가수 (YouTube Music 사용)
    # -----------------------------------------------
    if category == 'IDOL':
        # 방금 만든 유튜브 뮤직 함수 실행
        return search_youtube_music_artist(query)

    # -----------------------------------------------
    # CASE B: 노래 (iTunes 사용 - 기존 유지)
    # -----------------------------------------------
    else: # MUSIC
        base_url = "https://itunes.apple.com/search"
        params = {
            "term": query,
            "media": "music",
            "entity": "song",
            "country": "KR",
            "limit": 10
        }
        results = []
        try:
            response = requests.get(base_url, params=params, timeout=5)
            data = response.json()
            
            for item in data.get('results', []):
                artwork = item.get('artworkUrl100')
                if artwork:
                    artwork = artwork.replace('100x100bb', '600x600bb')

                results.append({
                    "id": f"MUSIC_{item.get('trackId')}",
                    "name": item.get('trackName'),
                    "subtitle": item.get('artistName'),
                    "image": artwork,
                    "type": "MUSIC",
                    "desc": item.get('collectionName')
                })
        except Exception as e:
            print(f"[iTunes] Error: {e}")
            
        return results

# ==========================================
# 4. 스포츠 팀 검색 (RapidAPI 활용)
# ==========================================
def search_sports(query):
    """
    4대 종목(축구, 야구, 농구, F1) + 배구 팀 검색
    """
    results = []

    # [0]종목명, [1]API Host, [2]팀 검색 URL, [3]선수 검색 URL(None으로 꺼둠)
    search_targets = [
        ("Football", "v3.football.api-sports.io", "/teams"),
        ("Baseball", "v1.baseball.api-sports.io", "/teams"), 
        ("Basketball", "v1.basketball.api-sports.io", "/teams"), 
        ("Formula 1", "v1.formula-1.api-sports.io", "/teams"),
        ("Volleyball", "v1.volleyball.api-sports.io", "/teams"),
    ]

    print(f"\n--- 🔍 스포츠 팀 검색 시작: '{query}' ---")

    for sport_name, host, team_endpoint in search_targets:
        # RapidAPI 헤더 설정 코드 삭제 -> 공식 헤더(SPORTS_HEADERS) 사용
        base_url = f"https://{host}"

        # -----------------------------------------------
        # (A) 팀(Team/Constructor) 검색
        # -----------------------------------------------
        try:
            params = {"search": query}
            if sport_name == "Formula 1":
                params = {"name": query} 

            # ★ 여기서 headers에 SPORTS_HEADERS를 넣어줍니다.
            full_url = base_url + team_endpoint
            res = requests.get(full_url, headers=SPORTS_HEADERS, params=params)
            data = res.json()
            
            if data.get('response'):
                for item in data['response']:
                    
                    # 1. 이름과 로고 추출
                    if sport_name == "Football":
                        name = item['team']['name']
                        logo = item['team']['logo']
                        tm_id = item['team']['id']
                    elif sport_name == "Formula 1":
                        name = item['name']
                        logo = item['logo']
                        tm_id = item['id']
                    else: # Baseball, Basketball
                        name = item.get('name')
                        logo = item.get('logo')
                        tm_id = item.get('id')

                    if name:
                        results.append({
                            'id': f"{sport_name}_TEAM_{tm_id}", 
                            'name': name,
                            'image': logo,
                            'type': 'SPORTS',
                            'sub_type': 'TEAM',
                            'desc': f"{sport_name} Team"
                        })
        except Exception as e:
            print(f"[{sport_name}] Team Search Error: {e}")

    return results

# ==========================================
# 5. 음식 및 기타 (직접 입력 모드)
# ==========================================
def search_manual(query, type):
    # 음식이나 기타 카테고리는 이미지가 없으므로 기본 아이콘 사용
    return [{
        'id': query,
        'name': query,
        'image': None,
        'type': type,
        'desc': '직접 입력'
    }]