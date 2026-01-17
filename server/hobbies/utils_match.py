import requests
from datetime import datetime

# ==========================================
# 1. API-Sports 공식 키 (이미 Active 상태인 키!)
# ==========================================
# 세 번째 사진에 있는 키입니다.
API_KEY = "9c5932efc8bcdc57dc6dfb6193fce3d5"

# 공식 사이트용 헤더 (RapidAPI와 다릅니다!)
HEADERS = {
    "x-apisports-key": API_KEY
}

# 💡 시즌 계산 도우미 함수 (중요!)
def get_season(date_str, is_winter_sport=False):
    """
    날짜(YYYY-MM-DD)를 받아서 해당 스포츠의 '시즌 연도'를 반환합니다.
    """
    try:
        year = int(date_str[:4])
        month = int(date_str[5:7])

        if is_winter_sport:
            # 겨울 스포츠(농구,배구,유럽축구)는 1~6월이면 '작년 시즌'으로 침
            if month <= 6:
                return str(year - 1)
            else:
                return str(year)
        else:
            # 여름 스포츠(야구,K리그)는 그냥 그 해가 시즌
            return str(year)
    except:
        return datetime.today().strftime("%Y")


# ==========================================
# 2. ⚽ 축구 (Football)
# ==========================================
def get_football_matches(date):
    # ★ 주소가 RapidAPI에서 공식 주소로 변경됨
    url = "https://v3.football.api-sports.io/fixtures"
    
    # 축구는 리그마다 시즌이 달라서 복잡하지만, 일단 겨울 스포츠 로직 적용
    current_season = get_season(date, is_winter_sport=True)
    target_leagues = [292, 39, 140, 78, 135, 61]
    
    all_matches = []
    for league_id in target_leagues:
        try:
            params = {"date": date, "league": league_id, "season": current_season}
            res = requests.get(url, headers=HEADERS, params=params)
            data = res.json()
            if data.get('response'):
                for item in data['response']:
                    all_matches.append({
                        "type": "FOOTBALL",
                        "league": item['league']['name'],
                        "home": item['teams']['home']['name'],
                        "away": item['teams']['away']['name'],
                        "time": item['fixture']['date'][11:16],
                        "status": item['fixture']['status']['short'],
                        "home_score": item['goals']['home'],
                        "away_score": item['goals']['away'],
                        "logo_home": item['teams']['home']['logo'],
                        "logo_away": item['teams']['away']['logo']
                    })
        except: continue
    return all_matches

# ==========================================
# 3. ⚾ 야구 (Baseball)
# ==========================================
def get_baseball_matches(date):
    url = "https://v1.baseball.api-sports.io/games"
    current_season = get_season(date, is_winter_sport=False)
    target_leagues = [1, 30]
    
    all_matches = []
    for league_id in target_leagues:
        try:
            params = {"date": date, "league": league_id, "season": current_season}
            res = requests.get(url, headers=HEADERS, params=params)
            data = res.json()
            if data.get('response'):
                for item in data['response']:
                    all_matches.append({
                        "type": "BASEBALL",
                        "league": item['league']['name'],
                        "home": item['teams']['home']['name'],
                        "away": item['teams']['away']['name'],
                        "time": item['time'],
                        "status": item['status']['short'],
                        "home_score": item['scores']['home']['total'],
                        "away_score": item['scores']['away']['total'],
                        "logo_home": item['teams']['home']['logo'],
                        "logo_away": item['teams']['away']['logo']
                    })
        except: continue
    return all_matches

# ==========================================
# 4. 🏀 농구 (Basketball)
# ==========================================
def get_basketball_matches(date):
    url = "https://v1.basketball.api-sports.io/games"
    current_season = get_season(date, is_winter_sport=True)
    target_leagues = [12, 54]
    
    all_matches = []
    for league_id in target_leagues:
        try:
            params = {"date": date, "league": league_id, "season": current_season}
            res = requests.get(url, headers=HEADERS, params=params)
            data = res.json()
            if data.get('response'):
                for item in data['response']:
                    all_matches.append({
                        "type": "BASKETBALL",
                        "league": item['league']['name'],
                        "home": item['teams']['home']['name'],
                        "away": item['teams']['away']['name'],
                        "time": item['time'],
                        "status": item['status']['short'],
                        "home_score": item['scores']['home']['total'],
                        "away_score": item['scores']['away']['total'],
                        "logo_home": item['teams']['home']['logo'],
                        "logo_away": item['teams']['away']['logo']
                    })
        except: continue
    return all_matches

# ==========================================
# 5. 🏎️ F1 (Formula 1)
# ==========================================
def get_f1_matches(date):
    url = "https://v1.formula-1.api-sports.io/races"
    season = date[:4]
    
    all_matches = []
    try:
        params = {"season": season, "type": "race"}
        res = requests.get(url, headers=HEADERS, params=params)
        data = res.json()
        if data.get('response'):
            for item in data['response']:
                # 날짜가 일치하는지 확인
                if item['date'][:10] == date:
                    all_matches.append({
                        "type": "F1",
                        "league": "Formula 1",
                        "home": item['competition']['name'],
                        "away": item['circuit']['name'],
                        "time": item['date'][11:16],
                        "status": item['status'],
                        "home_score": 0, "away_score": 0,
                        "logo_home": "https://media.api-sports.io/formula-1/competitions/1.png",
                        "logo_away": None
                    })
    except: pass
    return all_matches

# ==========================================
# 6. 🏐 배구 (Volleyball)
# ==========================================
def get_volleyball_matches(date):
    url = "https://v1.volleyball.api-sports.io/games"
    current_season = get_season(date, is_winter_sport=True)
    target_leagues = [195, 196]
    
    all_matches = []
    for league_id in target_leagues:
        try:
            params = {"date": date, "league": league_id, "season": current_season}
            res = requests.get(url, headers=HEADERS, params=params)
            data = res.json()
            if data.get('response'):
                for item in data['response']:
                    all_matches.append({
                        "type": "VOLLEYBALL",
                        "league": item['league']['name'],
                        "home": item['teams']['home']['name'],
                        "away": item['teams']['away']['name'],
                        "time": item['time'],
                        "status": item['status']['short'],
                        "home_score": item['scores']['home']['total'],
                        "away_score": item['scores']['away']['total'],
                        "logo_home": item['teams']['home']['logo'],
                        "logo_away": item['teams']['away']['logo']
                    })
        except: continue
    return all_matches