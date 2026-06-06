#!/usr/bin/env python3
"""Build a unified Serie A player dataset from SQLite + Top5 CSV sources.

Output schema:
id,name,club,season,position,rating,source,elite,eliteSeasonBonus,legendTier
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sqlite3
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable


OUTPUT_FIELDS = [
    "id",
    "name",
    "club",
    "season",
    "position",
    "sub_positions",
    "rating",
    "source",
    "elite",
    "eliteSeasonBonus",
    "legendTier"
]
POSITIONS = {"GK", "DEF", "MID", "ATT"}
SUB_POSITIONS = {
    "GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST", "SS"
}
ITALY_SERIE_A_LEAGUE_ID = 10257
DEFAULT_SQLITE_PATH = Path("/Users/charlescollin/Downloads/database.sqlite")
DEFAULT_TOP5_PATH = Path("/Users/charlescollin/Downloads/Top5_League_Players_2017to2024_dataset.csv")
DEFAULT_OUTPUT_DIR = Path("public/data")
MIN_EURO_APPEARANCES = 3
MIN_TOP5_MINUTES = 300
RATING_BUCKETS = [
    (0.01, 93, 95),
    (0.05, 88, 92),
    (0.15, 84, 87),
    (0.35, 79, 83),
    (1.00, 70, 78)
]

ELITE_PLAYERS_BY_SEASON = {
    "2008-09": ["Zlatan Ibrahimović", "Kaká", "Júlio César", "Diego Milito", "Alessandro Del Piero"],
    "2009-10": ["Diego Milito", "Wesley Sneijder", "Samuel Eto'o", "Antonio Di Natale", "Javier Zanetti"],
    "2010-11": ["Zlatan Ibrahimović", "Thiago Silva", "Antonio Di Natale", "Edinson Cavani", "Wesley Sneijder"],
    "2011-12": ["Andrea Pirlo", "Zlatan Ibrahimović", "Claudio Marchisio", "Thiago Silva", "Edinson Cavani"],
    "2012-13": ["Andrea Pirlo", "Edinson Cavani", "Arturo Vidal", "Gianluigi Buffon", "Stephan El Shaarawy"],
    "2013-14": ["Andrea Pirlo", "Carlos Tévez", "Arturo Vidal", "Paul Pogba", "Gianluigi Buffon"],
    "2014-15": ["Carlos Tévez", "Paul Pogba", "Gianluigi Buffon", "Leonardo Bonucci", "Gonzalo Higuaín"],
    "2015-16": ["Gonzalo Higuaín", "Leonardo Bonucci", "Gianluigi Buffon", "Paulo Dybala", "Miralem Pjanić"],
    "2016-17": ["Gianluigi Buffon", "Dries Mertens", "Paulo Dybala", "Leonardo Bonucci", "Marek Hamšík"],
    "2017-18": ["Mauro Icardi", "Ciro Immobile", "Sergej Milinković-Savić", "Kalidou Koulibaly", "Giorgio Chiellini"],
    "2018-19": ["Cristiano Ronaldo", "Fabio Quagliarella", "Kalidou Koulibaly", "Duván Zapata", "Samir Handanović"],
    "2019-20": ["Cristiano Ronaldo", "Paulo Dybala", "Ciro Immobile", "Romelu Lukaku", "Alejandro Gómez"],
    "2020-21": ["Romelu Lukaku", "Cristiano Ronaldo", "Nicolò Barella", "Achraf Hakimi", "Lautaro Martínez"],
    "2021-22": ["Rafael Leão", "Mike Maignan", "Theo Hernández", "Dušan Vlahović", "Sergej Milinković-Savić"],
    "2022-23": ["Victor Osimhen", "Khvicha Kvaratskhelia", "Lautaro Martínez", "Kim Min-jae", "Nicolò Barella"],
    "2023-24": ["Lautaro Martínez", "Hakan Çalhanoğlu", "Alessandro Bastoni", "Dušan Vlahović", "Marcus Thuram"]
}

S_PLUS_NAMES = {
    "Cristiano Ronaldo",
    "Zlatan Ibrahimović",
    "Andrea Pirlo",
    "Gianluigi Buffon",
    "Kaká"
}

S_TIER_ICONIC_SEASONS = {
    ("2009-10", "Diego Milito"),
    ("2009-10", "Wesley Sneijder"),
    ("2012-13", "Edinson Cavani"),
    ("2013-14", "Carlos Tévez"),
    ("2015-16", "Gonzalo Higuaín"),
    ("2018-19", "Fabio Quagliarella"),
    ("2019-20", "Ciro Immobile"),
    ("2020-21", "Romelu Lukaku"),
    ("2022-23", "Victor Osimhen"),
    ("2023-24", "Lautaro Martínez")
}

CLUB_ALIASES = {
    "AC Milan": "Milan",
    "Internazionale": "Inter",
    "Inter Milan": "Inter",
    "Chievo": "Chievo Verona",
    "Hellas": "Hellas Verona",
    "Reggina": "Reggio Calabria",
    "AS Roma": "Roma",
    "SS Lazio": "Lazio",
    "SSC Napoli": "Napoli",
    "ACF Fiorentina": "Fiorentina",
    "UC Sampdoria": "Sampdoria",
    "US Sassuolo": "Sassuolo",
    "SPAL 2013": "SPAL"
}


@dataclass
class Candidate:
    name: str
    club: str
    season: int
    position: str
    sub_positions: list[str]
    raw_rating: float
    source: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare all-time Serie A draft dataset.")
    parser.add_argument("sqlite_path", nargs="?", type=Path, default=DEFAULT_SQLITE_PATH)
    parser.add_argument("top5_csv_path", nargs="?", type=Path, default=DEFAULT_TOP5_PATH)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--min-european-appearances", type=int, default=MIN_EURO_APPEARANCES)
    parser.add_argument("--min-top5-minutes", type=int, default=MIN_TOP5_MINUTES)
    return parser.parse_args()


def clean_text(value: object) -> str:
    return str(value or "").strip()


def normalize_club(value: object) -> str:
    club = clean_text(value)
    return CLUB_ALIASES.get(club, club)


def normalize_name(value: object) -> str:
    return re.sub(r"\s+", " ", clean_text(value))


def slugify(value: object) -> str:
    text = unicodedata.normalize("NFKD", clean_text(value)).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return text or "unknown"


def identity_key(value: object) -> str:
    text = unicodedata.normalize("NFKD", normalize_name(value)).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def season_label_from_int(season: int) -> str:
    value = str(season).zfill(4)
    return f"20{value[:2]}-{value[2:]}"


ELITE_KEYS_BY_SEASON = {
    season: {identity_key(player) for player in players}
    for season, players in ELITE_PLAYERS_BY_SEASON.items()
}
S_PLUS_KEYS = {identity_key(player) for player in S_PLUS_NAMES}
S_TIER_ICONIC_KEYS = {
    (season, identity_key(player))
    for season, player in S_TIER_ICONIC_SEASONS
}

MANUAL_SUB_POSITIONS = {
    "francescototti": ["CAM", "CF", "ST"],
    "paolomaldini": ["CB", "LB"],
    "javierzanetti": ["RB", "RM", "CM"],
    "danielederossi": ["CDM", "CM"],
    "giovannidilorenzo": ["RB", "RWB"],
    "dilorenzo": ["RB", "RWB"],
    "giorgiochiellini": ["CB", "LB"],
    "leonardobonucci": ["CB"],
    "alessandrobastoni": ["CB"],
    "kalidoukoulibaly": ["CB"],
    "kimminjae": ["CB"],
    "theohernandez": ["LB", "LWB"],
    "achrafhakimi": ["RWB", "RB", "RM"],
    "mariohezonja": ["RW"],
    "mohamedsalah": ["RW", "LW"],
    "rafaelleao": ["LW", "CF"],
    "khvichakvaratskhelia": ["LW", "RW"],
    "lautaromartinez": ["ST", "CF", "SS"],
    "paulodybala": ["SS", "CAM", "CF"],
    "carlostevez": ["ST", "CF", "SS"],
    "alessandrodelpiero": ["SS", "ST", "LW"],
    "zlatanibrahimovic": ["ST", "CF"],
    "cristianoronaldo": ["LW", "ST", "CF"],
    "andreapirlo": ["CDM", "CM"],
    "wesleysneijder": ["CAM", "CM"],
    "marekhamsik": ["CAM", "CM"],
    "nicolo barella": ["CM", "RM"],
    "nicolo barella": ["CM", "RM"],
    "nicolobarella": ["CM", "RM"],
    "sergejmilinkovicsavic": ["CM", "CAM"],
    "hakancalhanoglu": ["CM", "CAM", "CDM"],
    "miralempjanic": ["CM", "CDM", "CAM"]
}

SUB_POSITION_FALLBACKS = {
    "GK": ["GK"],
    "DEF": ["CB"],
    "MID": ["CM"],
    "ATT": ["ST"]
}


def dedupe_key(candidate: Candidate) -> tuple[str, str, int]:
    return (slugify(candidate.name), slugify(candidate.club), candidate.season)


def to_float(value: object, default: float = 0.0) -> float:
    text = clean_text(value).replace(",", ".")
    if not text:
        return default
    try:
        return float(text)
    except ValueError:
        return default


def to_int(value: object, default: int = 0) -> int:
    try:
        return int(float(clean_text(value).replace(",", ".")))
    except ValueError:
        return default


def season_to_int(value: object) -> int | None:
    text = clean_text(value)
    if re.fullmatch(r"\d{4}", text):
        return int(text)
    match = re.fullmatch(r"(\d{4})/(\d{4})", text)
    if match:
        start = int(match.group(1)) % 100
        end = int(match.group(2)) % 100
        return start * 100 + end
    return None


def parse_date(value: object) -> datetime | None:
    text = clean_text(value)
    if not text:
        return None
    try:
        return datetime.fromisoformat(text.split(" ")[0])
    except ValueError:
        return None


def rating_from_bucket(bucket_index: int, bucket_size: int, low: int, high: int) -> int:
    if bucket_size <= 1:
        return high
    # Rank-based spread inside the bucket, intentionally independent of raw score scale.
    progress = bucket_index / (bucket_size - 1)
    return max(70, min(95, round(high - progress * (high - low))))


def map_top5_position(value: object) -> str:
    parts = [part.strip().upper() for part in clean_text(value).split(",") if part.strip()]
    primary = parts[0] if parts else ""
    if "GK" in primary:
        return "GK"
    if "DF" in primary:
        return "DEF"
    if "MF" in primary:
        return "MID"
    if "FW" in primary:
        return "ATT"
    return "MID"


def clean_sub_positions(values: Iterable[str], position: str) -> list[str]:
    seen = []
    for value in values:
        if value in SUB_POSITIONS and value not in seen:
            seen.append(value)
    return seen or SUB_POSITION_FALLBACKS[position]


def manual_sub_positions(name: object) -> list[str] | None:
    return MANUAL_SUB_POSITIONS.get(identity_key(name))


def map_top5_sub_positions(value: object, position: str, name: object) -> list[str]:
    manual = manual_sub_positions(name)
    if manual:
        return clean_sub_positions(manual, position)

    parts = [part.strip().upper() for part in clean_text(value).split(",") if part.strip()]
    mapped: list[str] = []
    for part in parts:
        if part in {"GK"}:
            mapped.append("GK")
        elif part in {"CB"}:
            mapped.append("CB")
        elif part in {"LB"}:
            mapped.extend(["LB", "LWB"])
        elif part in {"RB"}:
            mapped.extend(["RB", "RWB"])
        elif part in {"WB", "LWB", "RWB"}:
            mapped.extend(["LWB", "RWB"])
        elif part in {"DM", "CDM"}:
            mapped.extend(["CDM", "CM"])
        elif part in {"CM", "MF"}:
            mapped.append("CM")
        elif part in {"AM", "CAM"}:
            mapped.extend(["CAM", "CM"])
        elif part in {"LM"}:
            mapped.extend(["LM", "LW"])
        elif part in {"RM"}:
            mapped.extend(["RM", "RW"])
        elif part in {"LW"}:
            mapped.extend(["LW", "CF"])
        elif part in {"RW"}:
            mapped.extend(["RW", "CF"])
        elif part in {"FW", "ST"}:
            mapped.extend(["ST", "CF"])
        elif part in {"SS", "CF"}:
            mapped.extend(["CF", "SS", "ST"])
        elif "DF" in part:
            mapped.append("CB")
        elif "MF" in part:
            mapped.append("CM")
        elif "FW" in part:
            mapped.append("ST")

    return clean_sub_positions(mapped, position)


def map_european_position(avg_y: float | None, slot_index: int | None, raw_rating: float, gk_rating: float) -> str:
    if slot_index == 1 or gk_rating >= raw_rating * 0.82:
        return "GK"
    if avg_y is None:
        if slot_index and slot_index <= 5:
            return "DEF"
        if slot_index and slot_index <= 8:
            return "MID"
        return "ATT"
    if avg_y <= 3.0:
        return "DEF"
    if avg_y <= 7.0:
        return "MID"
    return "ATT"


def map_european_sub_positions(position: str, avg_slot: int | None, name: object) -> list[str]:
    manual = manual_sub_positions(name)
    if manual:
        return clean_sub_positions(manual, position)

    if position == "GK":
        return ["GK"]
    if position == "DEF":
        if avg_slot is not None and avg_slot <= 2:
            return ["RB", "RWB"]
        if avg_slot is not None and avg_slot >= 5:
            return ["LB", "LWB"]
        return ["CB"]
    if position == "MID":
        if avg_slot is not None and avg_slot <= 6:
            return ["CDM", "CM"]
        if avg_slot is not None and avg_slot >= 9:
            return ["CAM", "CM"]
        return ["CM"]
    if avg_slot is not None and avg_slot <= 9:
        return ["RW", "CF"]
    if avg_slot is not None and avg_slot >= 11:
        return ["LW", "CF"]
    return ["ST", "CF"]


def top5_rating(row: dict[str, str], position: str) -> float:
    minutes = to_float(row.get("Playing Time_Min"))
    ninety = max(to_float(row.get("Playing Time_90s")), minutes / 90, 1.0)
    minutes_score = min(1.0, math.log1p(max(minutes, 0)) / math.log1p(3200))
    sample_factor = 0.62 + 0.38 * min(1.0, max(minutes, 0) / 1800)

    goals_90 = to_float(row.get("Per 90 Minutes_Gls"))
    assists_90 = to_float(row.get("Per 90 Minutes_Ast"))
    xa_90 = to_float(row.get("Per 90 Minutes_xAG"))
    xg_xag_90 = to_float(row.get("Per 90 Minutes_xG+xAG"))
    shots_on_target_90 = to_float(row.get("Standard_SoT/90"))
    key_passes_90 = to_float(row.get("KP_")) / ninety
    progressive_passes_90 = to_float(row.get("PrgP_")) / ninety
    progressive_carries_90 = to_float(row.get("Progression_PrgC")) / ninety
    sca_90 = to_float(row.get("SCA_SCA90"))
    gca_90 = to_float(row.get("GCA_GCA90"))
    pass_accuracy = to_float(row.get("Total_Cmp%"))

    tackles_interceptions_90 = to_float(row.get("Tkl+Int_")) / ninety
    blocks_90 = to_float(row.get("Blocks_Blocks")) / ninety
    clearances_90 = to_float(row.get("Clr_")) / ninety
    aerials_won_90 = to_float(row.get("Aerial Duels_Won")) / ninety
    recoveries_90 = to_float(row.get("Performance_Recov")) / ninety
    starts = to_float(row.get("Starts_Starts"))
    team_ga_90 = to_float(row.get("Team Success_onGA")) / ninety if ninety else 1.4
    team_xga_90 = to_float(row.get("Team Success (xG)_onxGA")) / ninety if ninety else 1.4

    if position == "GK":
        ppm = to_float(row.get("Team Success_PPM"))
        goal_prevention = max(0, 1.55 - ((team_ga_90 + team_xga_90) / 2))
        return (38 + minutes_score * 22 + starts * 0.28 + goal_prevention * 18 + ppm * 4) * sample_factor
    if position == "DEF":
        return (
            36
            + minutes_score * 22
            + tackles_interceptions_90 * 2.4
            + blocks_90 * 1.6
            + clearances_90 * 0.75
            + aerials_won_90 * 0.95
            + recoveries_90 * 0.4
            + pass_accuracy * 0.04
            + (goals_90 + assists_90) * 3.5
        ) * sample_factor
    if position == "MID":
        return (
            36
            + minutes_score * 19
            + key_passes_90 * 2.7
            + progressive_passes_90 * 1.0
            + progressive_carries_90 * 0.85
            + sca_90 * 0.75
            + gca_90 * 2.6
            + recoveries_90 * 0.8
            + pass_accuracy * 0.035
            + goals_90 * 7
            + assists_90 * 6
            + xa_90 * 3.6
        ) * sample_factor
    return (
        36
        + minutes_score * 18
        + goals_90 * 30
        + assists_90 * 12
        + xg_xag_90 * 8
        + shots_on_target_90 * 4
        + sca_90 * 0.8
        + gca_90 * 3
        + progressive_carries_90 * 0.9
    ) * sample_factor


def load_top5_candidates(path: Path, min_minutes: int) -> list[Candidate]:
    candidates: list[Candidate] = []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        for row in reader:
            league = clean_text(row.get("league"))
            if "Serie A" not in league and not league.startswith("ITA"):
                continue
            minutes = to_int(row.get("Playing Time_Min"))
            if minutes < min_minutes:
                continue
            season = season_to_int(row.get("season"))
            if season is None:
                continue
            position = map_top5_position(row.get("pos_"))
            player_name = normalize_name(row.get("player"))
            candidates.append(
                Candidate(
                    name=player_name,
                    club=normalize_club(row.get("team")),
                    season=season,
                    position=position,
                    sub_positions=map_top5_sub_positions(row.get("pos_"), position, player_name),
                    raw_rating=top5_rating(row, position),
                    source="top5_stats"
                )
            )
    return candidates


def load_attribute_index(cursor: sqlite3.Cursor) -> dict[int, list[dict[str, float | datetime]]]:
    index: dict[int, list[dict[str, float | datetime]]] = defaultdict(list)
    rows = cursor.execute(
        """
        SELECT player_api_id, date, overall_rating,
               gk_diving, gk_handling, gk_kicking, gk_positioning, gk_reflexes
        FROM Player_Attributes
        WHERE overall_rating IS NOT NULL
        """
    ).fetchall()
    for row in rows:
        date = parse_date(row["date"])
        if date is None:
            continue
        gk_values = [to_float(row[key]) for key in ("gk_diving", "gk_handling", "gk_kicking", "gk_positioning", "gk_reflexes")]
        index[int(row["player_api_id"])].append(
            {
                "date": date,
                "overall": to_float(row["overall_rating"]),
                "gk": sum(gk_values) / len(gk_values)
            }
        )
    for values in index.values():
        values.sort(key=lambda item: item["date"])
    return index


def season_midpoint(season: int) -> datetime:
    start_year = 2000 + (season // 100)
    if season // 100 >= 90:
        start_year = 1900 + (season // 100)
    return datetime(start_year + 1, 1, 15)


def rating_for_player_season(
    attrs: list[dict[str, float | datetime]],
    season: int
) -> tuple[float, float] | None:
    if not attrs:
        return None
    midpoint = season_midpoint(season)
    season_start = datetime(midpoint.year - 1, 7, 1)
    season_end = datetime(midpoint.year, 7, 31)
    in_season = [item for item in attrs if season_start <= item["date"] <= season_end]
    pool = in_season or sorted(attrs, key=lambda item: abs((item["date"] - midpoint).days))[:1]
    overall = sum(float(item["overall"]) for item in pool) / len(pool)
    gk = sum(float(item["gk"]) for item in pool) / len(pool)
    return overall, gk


def european_raw_score(
    position: str,
    overall: float,
    gk_rating: float,
    appearances: int,
    goals_against: int,
    clean_sheets: int
) -> float:
    appearance_score = min(1.0, math.log1p(max(appearances, 0)) / math.log1p(38))
    if position == "GK":
        clean_sheet_rate = clean_sheets / max(1, appearances)
        goals_against_90 = goals_against / max(1, appearances)
        prevention = max(0, 1.75 - goals_against_90)
        return overall * 0.58 + gk_rating * 0.22 + clean_sheet_rate * 12 + prevention * 3.5 + appearance_score * 7
    if position == "DEF":
        clean_sheet_rate = clean_sheets / max(1, appearances)
        prevention = max(0, 1.65 - (goals_against / max(1, appearances)))
        return overall * 0.78 + clean_sheet_rate * 8 + prevention * 2.5 + appearance_score * 7
    if position == "MID":
        return overall * 0.9 + appearance_score * 8
    return overall * 0.92 + appearance_score * 7


def load_european_candidates(path: Path, min_appearances: int) -> list[Candidate]:
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    attr_index = load_attribute_index(cursor)
    players = {
        int(row["player_api_id"]): normalize_name(row["player_name"])
        for row in cursor.execute("SELECT player_api_id, player_name FROM Player").fetchall()
    }

    aggregates: dict[tuple[int, str, int], dict[str, object]] = {}
    matches = cursor.execute(
        """
        SELECT m.*, home.team_long_name AS home_team, away.team_long_name AS away_team
        FROM Match m
        JOIN Team home ON home.team_api_id = m.home_team_api_id
        JOIN Team away ON away.team_api_id = m.away_team_api_id
        WHERE m.league_id = ?
        """,
        (ITALY_SERIE_A_LEAGUE_ID,)
    ).fetchall()

    for match in matches:
        season = season_to_int(match["season"])
        if season is None:
            continue
        for side in ("home", "away"):
            club = normalize_club(match[f"{side}_team"])
            for slot in range(1, 12):
                player_api_id = match[f"{side}_player_{slot}"]
                if player_api_id is None:
                    continue
                key = (int(player_api_id), club, season)
                item = aggregates.setdefault(
                    key,
                    {"appearances": 0, "ys": [], "slots": [], "goals_against": 0, "clean_sheets": 0}
                )
                item["appearances"] = int(item["appearances"]) + 1
                goals_against = int(match["away_team_goal"] if side == "home" else match["home_team_goal"])
                item["goals_against"] = int(item["goals_against"]) + goals_against
                if goals_against == 0:
                    item["clean_sheets"] = int(item["clean_sheets"]) + 1
                y_value = match[f"{side}_player_Y{slot}"]
                if y_value is not None:
                    item["ys"].append(float(y_value))
                item["slots"].append(slot)

    candidates: list[Candidate] = []
    for (player_api_id, club, season), item in aggregates.items():
        appearances = int(item["appearances"])
        if appearances < min_appearances or player_api_id not in players:
            continue
        rating_pair = rating_for_player_season(attr_index.get(player_api_id, []), season)
        if rating_pair is None:
            continue
        overall, gk_rating = rating_pair
        ys = item["ys"]
        slots = item["slots"]
        avg_y = sum(ys) / len(ys) if ys else None
        avg_slot = round(sum(slots) / len(slots)) if slots else None
        position = map_european_position(avg_y, avg_slot, overall, gk_rating)
        player_name = players[player_api_id]
        candidates.append(
            Candidate(
                name=player_name,
                club=club,
                season=season,
                position=position,
                sub_positions=map_european_sub_positions(position, avg_slot, player_name),
                raw_rating=european_raw_score(
                    position,
                    overall,
                    gk_rating,
                    appearances,
                    int(item["goals_against"]),
                    int(item["clean_sheets"])
                ),
                source="european_soccer_db"
            )
        )

    conn.close()
    return candidates


def percentile_rating_map(candidates: list[Candidate]) -> dict[int, int]:
    ordered = sorted(candidates, key=lambda item: item.raw_rating, reverse=True)
    total = len(ordered)
    ratings: dict[int, int] = {}
    previous_limit = 0

    for cumulative_percent, low, high in RATING_BUCKETS:
        limit = total if cumulative_percent >= 1 else max(previous_limit + 1, math.ceil(total * cumulative_percent))
        bucket = ordered[previous_limit:limit]
        bucket_size = len(bucket)

        for bucket_index, candidate in enumerate(bucket):
            ratings[id(candidate)] = rating_from_bucket(bucket_index, bucket_size, low, high)

        previous_limit = limit

    return ratings


def base_row(item: Candidate, rating: int) -> dict[str, object]:
    return {
        "id": f"{slugify(item.name)}-{slugify(item.club)}-{str(item.season).zfill(4)}",
        "name": item.name,
        "club": item.club,
        "season": item.season,
        "position": item.position,
        "sub_positions": item.sub_positions,
        "rating": rating,
        "source": item.source,
        "elite": False,
        "eliteSeasonBonus": 0,
        "legendTier": "NONE"
    }


def non_elite_rating(base_rating: int) -> tuple[int, int]:
    if base_rating >= 90:
        penalty = 6
    elif base_rating >= 87:
        penalty = 5
    elif base_rating >= 84:
        penalty = 4
    elif base_rating >= 80:
        penalty = 3
    else:
        # Keep the playable Serie A pool mostly in the 74-86 band instead of
        # creating a large dead zone at 70-73.
        rating = min(79, 74 + math.floor((max(70, base_rating) - 70) * 6 / 10))
        return rating, 0
    return max(74, min(86, base_rating - penalty)), 0


def elite_rating(base_rating: int, season_label: str, player_name: str) -> tuple[int, int, str, bool]:
    player_key = identity_key(player_name)
    is_elite = player_key in ELITE_KEYS_BY_SEASON.get(season_label, set())

    if not is_elite:
        rating, bonus = non_elite_rating(base_rating)
        return rating, bonus, "NONE", False

    if player_key in S_PLUS_KEYS:
        if base_rating >= 92:
            rating = 95
        elif base_rating >= 88:
            rating = 94
        else:
            rating = 93
        return rating, max(0, rating - base_rating), "S+", True

    if (season_label, player_key) in S_TIER_ICONIC_KEYS:
        if base_rating >= 92:
            rating = 94
        elif base_rating >= 88:
            rating = 93
        else:
            rating = 92
        return rating, max(0, rating - base_rating), "S", True

    if base_rating >= 92:
        rating = 91
    elif base_rating >= 88:
        rating = 90
    elif base_rating >= 84:
        rating = 89
    else:
        rating = 88
    return rating, max(0, rating - base_rating), "A", True


def apply_elite_rating_model(rows: Iterable[dict[str, object]]) -> list[dict[str, object]]:
    adjusted_rows: list[dict[str, object]] = []
    for row in rows:
        base_rating = int(row["rating"])
        season_label = season_label_from_int(int(row["season"]))
        rating, bonus, legend_tier, elite = elite_rating(base_rating, season_label, str(row["name"]))
        adjusted = dict(row)
        adjusted.update(
            {
                "rating": rating,
                "elite": elite,
                "eliteSeasonBonus": bonus,
                "legendTier": legend_tier
            }
        )
        adjusted_rows.append(adjusted)
    return adjusted_rows


def normalize_candidates(candidates: Iterable[Candidate]) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    valid_candidates = [
        candidate
        for candidate in candidates
        if candidate.name and candidate.club and candidate.position in POSITIONS and candidate.sub_positions
    ]
    ratings = percentile_rating_map(valid_candidates)
    base_rows = [base_row(item, ratings[id(item)]) for item in valid_candidates]
    adjusted_rows = apply_elite_rating_model(base_rows)

    return base_rows, adjusted_rows


def dedupe_rows(rows: Iterable[dict[str, object]]) -> list[dict[str, object]]:
    deduped: dict[tuple[str, str, int], dict[str, object]] = {}
    source_priority = {"european_soccer_db": 2, "top5_stats": 1}
    for row in rows:
        key = (slugify(row["name"]), slugify(row["club"]), int(row["season"]))
        current = deduped.get(key)
        if current is None:
            deduped[key] = row
            continue
        current_rank = (int(current["rating"]), source_priority.get(str(current["source"]), 0))
        next_rank = (int(row["rating"]), source_priority.get(str(row["source"]), 0))
        if next_rank > current_rank:
            deduped[key] = row
    return sorted(deduped.values(), key=lambda row: (int(row["season"]), str(row["club"]), -int(row["rating"]), str(row["name"])))


def write_rating_distribution_svg(rows: list[dict[str, object]], output_dir: Path, filename: str, title: str, subtitle: str) -> Path:
    ratings = Counter(int(row["rating"]) for row in rows)
    min_rating = 70
    max_rating = 95
    values = [ratings.get(rating, 0) for rating in range(min_rating, max_rating + 1)]
    max_count = max(values) if values else 1
    width = 980
    height = 520
    margin_left = 64
    margin_right = 28
    margin_top = 70
    margin_bottom = 70
    chart_width = width - margin_left - margin_right
    chart_height = height - margin_top - margin_bottom
    bar_gap = 4
    bar_width = (chart_width - bar_gap * (len(values) - 1)) / len(values)

    bars = []
    labels = []
    for index, rating in enumerate(range(min_rating, max_rating + 1)):
        count = ratings.get(rating, 0)
        bar_height = (count / max_count) * chart_height if max_count else 0
        x = margin_left + index * (bar_width + bar_gap)
        y = margin_top + chart_height - bar_height
        color = "#C8A45D" if rating >= 92 else "#008CFF" if rating >= 88 else "#94A3B8"
        bars.append(
            f'<rect x="{x:.2f}" y="{y:.2f}" width="{bar_width:.2f}" height="{bar_height:.2f}" rx="4" fill="{color}" />'
        )
        if rating % 2 == 0 or rating in (95,):
            labels.append(
                f'<text x="{x + bar_width / 2:.2f}" y="{height - 32}" text-anchor="middle" '
                f'font-size="12" fill="#475569">{rating}</text>'
            )

    guide_lines = []
    for pct in (0.25, 0.5, 0.75, 1.0):
        y = margin_top + chart_height - chart_height * pct
        value = round(max_count * pct)
        guide_lines.append(f'<line x1="{margin_left}" y1="{y:.2f}" x2="{width - margin_right}" y2="{y:.2f}" stroke="#E2E8F0" stroke-width="1" />')
        guide_lines.append(f'<text x="{margin_left - 10}" y="{y + 4:.2f}" text-anchor="end" font-size="12" fill="#64748B">{value}</text>')

    ninety_plus = sum(count for rating, count in ratings.items() if rating >= 90)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="100%" height="100%" fill="#F8FAFC"/>
  <text x="{margin_left}" y="34" font-size="24" font-weight="800" fill="#0F172A">{title}</text>
  <text x="{margin_left}" y="56" font-size="13" fill="#64748B">{subtitle} · n={len(rows)} · 90+={ninety_plus}</text>
  {''.join(guide_lines)}
  <line x1="{margin_left}" y1="{margin_top + chart_height}" x2="{width - margin_right}" y2="{margin_top + chart_height}" stroke="#CBD5E1" stroke-width="1.5" />
  <line x1="{margin_left}" y1="{margin_top}" x2="{margin_left}" y2="{margin_top + chart_height}" stroke="#CBD5E1" stroke-width="1.5" />
  {''.join(bars)}
  {''.join(labels)}
  <text x="{width / 2}" y="{height - 8}" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">Rating</text>
  <text x="18" y="{margin_top + chart_height / 2}" transform="rotate(-90 18 {margin_top + chart_height / 2})" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">Players</text>
  <text x="{width - margin_right}" y="38" text-anchor="end" font-size="12" fill="#334155">Gold: 92+ · Blue: 88-91</text>
</svg>
"""
    svg_path = output_dir / filename
    svg_path.write_text(svg, encoding="utf-8")
    return svg_path


def write_outputs(
    rows: list[dict[str, object]],
    before_rows: list[dict[str, object]],
    output_dir: Path
) -> tuple[Path, Path, Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    csv_path = output_dir / "players_seriea_alltime.csv"
    json_path = output_dir / "players_seriea_alltime.json"

    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        for row in rows:
            csv_row = dict(row)
            csv_row["sub_positions"] = "|".join(str(value) for value in row["sub_positions"])
            writer.writerow(csv_row)

    with json_path.open("w", encoding="utf-8") as handle:
        json.dump(rows, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    before_svg_path = write_rating_distribution_svg(
        before_rows,
        output_dir,
        "players_seriea_rating_distribution_before.svg",
        "Serie A rating distribution before elite model",
        "Percentile baseline before non-elite compression"
    )
    after_svg_path = write_rating_distribution_svg(
        rows,
        output_dir,
        "players_seriea_rating_distribution_after.svg",
        "Serie A rating distribution after elite model",
        "Elite-season access to 90+ ratings, non-elite players compressed"
    )

    return csv_path, json_path, before_svg_path, after_svg_path


def main() -> None:
    args = parse_args()
    european = load_european_candidates(args.sqlite_path, args.min_european_appearances)
    top5 = load_top5_candidates(args.top5_csv_path, args.min_top5_minutes)
    before_rows_raw, rows_raw = normalize_candidates([*european, *top5])
    before_rows = dedupe_rows(before_rows_raw)
    rows = dedupe_rows(rows_raw)
    csv_path, json_path, before_svg_path, after_svg_path = write_outputs(rows, before_rows, args.output_dir)

    clubs = sorted({str(row["club"]) for row in rows})
    before_90_plus = sum(1 for row in before_rows if int(row["rating"]) >= 90)
    after_90_plus = sum(1 for row in rows if int(row["rating"]) >= 90)
    after_94_plus = sum(1 for row in rows if int(row["rating"]) >= 94)
    elite_count = sum(1 for row in rows if bool(row["elite"]))
    print(f"European Soccer Database candidates: {len(european)}")
    print(f"Top5 candidates: {len(top5)}")
    print(f"Final deduped players: {len(rows)}")
    print(f"Serie A clubs: {len(clubs)}")
    print(f"Elite player seasons: {elite_count}")
    print(f"90+ before elite model: {before_90_plus}")
    print(f"90+ after elite model: {after_90_plus}")
    print(f"94+ after elite model: {after_94_plus}")
    print(f"CSV: {csv_path}")
    print(f"JSON: {json_path}")
    print(f"Rating distribution before SVG: {before_svg_path}")
    print(f"Rating distribution after SVG: {after_svg_path}")


if __name__ == "__main__":
    main()
