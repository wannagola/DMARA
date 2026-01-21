import requests
import base64
from ytmusicapi import YTMusic

# ==========================================
# 1. API KEY 설정
# ==========================================
TMDB_API_KEY = "768ac0bb22bfc1cee7d2cc7a9e682be6"
SPORTS_API_KEY = "9c5932efc8bcdc57dc6dfb6193fce3d5"

SPORTS_HEADERS = {
    "x-apisports-key": SPORTS_API_KEY
}

# ==========================================
# [NEW] TMDB 장르 ID -> 텍스트 변환 맵
# ==========================================
TMDB_GENRES = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
    10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
}

# ==========================================
# 2. TMDB (영화, 드라마, 배우) 검색 함수
# ==========================================
def search_tmdb(query, category):
    base_url = "https://api.themoviedb.org/3/search/"
    image_base_url = "https://image.tmdb.org/t/p/w500"
    
    if category == 'ACTOR':
        url = base_url + "person"
    elif category == 'MOVIE':
        url = base_url + "movie"
    elif category == 'DRAMA' or category == 'OTT':
        url = base_url + "tv"
    else:
        return []

    def fetch_from_tmdb(lang):
        params = {
            "api_key": TMDB_API_KEY,
            "query": query,
            "language": lang,
            "page": 1,
            "include_adult": "false"
        }
        try:
            return requests.get(url, params=params).json().get('results', [])
        except:
            return []

    # 1. 데이터 가져오기 (영어 + 한국어 병합)
    results_en = fetch_from_tmdb("en-US")
    results_ko = fetch_from_tmdb("ko-KR")
    merged_results = {}

    for item in results_en:
        item['lang_source'] = 'en'
        merged_results[item['id']] = item

    for item in results_ko:
        item['lang_source'] = 'ko'
        merged_results[item['id']] = item

    # 2. 최종 리스트 변환
    final_list = []
    
    for item in merged_results.values():
        image_path = item.get('poster_path') or item.get('profile_path')
        full_image_url = image_base_url + image_path if image_path else None

        title = item.get('title') or item.get('name')
        overview = item.get('overview') or ""
        
        # ★ [수정됨] 장르 정보 추출 로직 추가
        genre_names = []
        if 'genre_ids' in item:
            for gid in item['genre_ids']:
                if gid in TMDB_GENRES:
                    genre_names.append(TMDB_GENRES[gid])
        
        # 배우의 경우
        if category == 'ACTOR':
            known_works = [w.get('title') or w.get('name') for w in item.get('known_for', [])]
            desc = ", ".join([w for w in known_works if w])
        else:
            date = item.get('release_date') or item.get('first_air_date') or ""
            desc = f"({date[:4]}) {overview[:50]}..." if date else overview[:50]

        final_list.append({
            "id": f"{category}_{item.get('id')}",
            "name": title,
            "subtitle": item.get('original_title') or item.get('original_name'), 
            "image": full_image_url,
            "type": category,
            "desc": desc,
            # ★ 프론트엔드로 장르 목록을 보내줍니다.
            "genres": genre_names 
        })

    final_list.sort(key=lambda x: merged_results[int(x['id'].split('_')[1])].get('popularity', 0), reverse=True)

    return final_list

# ==========================================
# [유지] 유튜브 뮤직 아티스트 검색
# ==========================================
def search_youtube_music_artist(query):
    yt = YTMusic()
    search_results = yt.search(query, filter='artists')
    
    results = []
    for item in search_results[:5]: 
        try:
            image_url = item['thumbnails'][-1]['url'] if item.get('thumbnails') else None
            results.append({
                "id": f"ARTIST_{item['browseId']}", 
                "name": item['artist'],             
                "subtitle": "Artist",               
                "image": image_url,                 
                "type": "IDOL",                     
            })
        except Exception as e:
            continue
    return results

# ==========================================
# [유지] 음악/아이돌 통합 검색
# ==========================================
def search_spotify(query, category):
    if category == 'IDOL':
        return search_youtube_music_artist(query)
    else: 
        base_url = "https://itunes.apple.com/search"
        params = {
            "term": query,
            "media": "music",
            "entity": "song",
            "country": "KR",
            "limit": 20
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
# [유지] 스포츠 팀 검색
# ==========================================
def search_sports(query):
    results = []
    search_targets = [
        ("Football", "v3.football.api-sports.io", "/teams"),
        ("Baseball", "v1.baseball.api-sports.io", "/teams"), 
        ("Basketball", "v1.basketball.api-sports.io", "/teams"), 
        ("Formula 1", "v1.formula-1.api-sports.io", "/teams"),
        ("Volleyball", "v1.volleyball.api-sports.io", "/teams"),
    ]

    for sport_name, host, team_endpoint in search_targets:
        base_url = f"https://{host}"
        try:
            params = {"search": query}
            
            full_url = base_url + team_endpoint
            res = requests.get(full_url, headers=SPORTS_HEADERS, params=params)
            data = res.json()
            
            if data.get('response'):
                for item in data['response']:
                    if sport_name == "Football":
                        name = item['team']['name']
                        logo = item['team']['logo']
                        tm_id = item['team']['id']
                    elif sport_name == "Formula 1":
                        name = item['name']
                        logo = item['logo']
                        tm_id = item['id']
                    else: 
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

def search_manual(query, type):
    return [{
        'id': query,
        'name': query,
        'image': None,
        'type': type,
        'desc': '직접 입력'
    }]