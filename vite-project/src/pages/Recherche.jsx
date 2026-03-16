import "../CSS/Recherche.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsersNav } from "../api";

const AGE_MIN = 18;
const AGE_MAX = 99;
const POP_MIN = 0;
const POP_MAX = 300;
const SEARCH_FILTERS_STORAGE_KEY = "recherche_filters_v1";
const SORT_LABELS = {
  age: "Âge",
  popularity: "Popularité",
  city: "Localisation",
};

const AVAILABLE_TAGS = [
  { label: "Sport", value: "sport" },
  { label: "Voyage", value: "voyage" },
  { label: "Musique", value: "musique" },
  { label: "Cinéma", value: "cinema" },
  { label: "Jeux vidéo", value: "jeux" },
  { label: "Cuisine", value: "cuisine" },
  { label: "Lecture", value: "lecture" },
  { label: "Tech", value: "tech" },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function loadSavedFilters() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(SEARCH_FILTERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const ageMin = clamp(Number(parsed.ageMin), AGE_MIN, AGE_MAX);
    const ageMax = clamp(Number(parsed.ageMax), AGE_MIN, AGE_MAX);
    const popularityMin = clamp(Number(parsed.popularityMin), POP_MIN, POP_MAX);
    const popularityMax = clamp(Number(parsed.popularityMax), POP_MIN, POP_MAX);
    const sortBy = ["age", "popularity", "city"].includes(parsed.sortBy) ? parsed.sortBy : "";
    const orderBy = parsed.orderBy === "asc" ? "asc" : "desc";

    return {
      ageMin: Number.isFinite(ageMin) ? ageMin : AGE_MIN,
      ageMax: Number.isFinite(ageMax) ? ageMax : AGE_MAX,
      popularityMin: Number.isFinite(popularityMin) ? popularityMin : POP_MIN,
      popularityMax: Number.isFinite(popularityMax) ? popularityMax : POP_MAX,
      location: typeof parsed.location === "string" ? parsed.location : "",
      selectedTags: Array.isArray(parsed.selectedTags)
        ? parsed.selectedTags.filter((tag) => typeof tag === "string")
        : [],
      sortBy,
      orderBy: sortBy ? orderBy : "desc",
    };
  } catch (_) {
    return null;
  }
}

function Recherche() {
  const navigate = useNavigate();
  const savedFilters = useMemo(() => loadSavedFilters(), []);
  const [ageMin, setAgeMin] = useState(savedFilters?.ageMin ?? AGE_MIN);
  const [ageMax, setAgeMax] = useState(savedFilters?.ageMax ?? AGE_MAX);
  const [popularityMin, setPopularityMin] = useState(savedFilters?.popularityMin ?? POP_MIN);
  const [popularityMax, setPopularityMax] = useState(savedFilters?.popularityMax ?? POP_MAX);
  const [location, setLocation] = useState(savedFilters?.location ?? "");
  const [selectedTags, setSelectedTags] = useState(savedFilters?.selectedTags ?? []);
  const [sortBy, setSortBy] = useState(savedFilters?.sortBy ?? "");
  const [orderBy, setOrderBy] = useState(savedFilters?.orderBy ?? "desc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  const toggleTag = (tagValue) => {
    setSelectedTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const reset = () => {
    setAgeMin(AGE_MIN);
    setAgeMax(AGE_MAX);
    setPopularityMin(POP_MIN);
    setPopularityMax(POP_MAX);
    setLocation("");
    setSelectedTags([]);
    setSortBy("");
    setOrderBy("desc");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SEARCH_FILTERS_STORAGE_KEY);
    }
  };

  const filters = useMemo(() => {
    const f = {
      ageMin,
      ageMax,
    };
    f.popularityMin = popularityMin;
    f.popularityMax = popularityMax;
    const trimmedCity = location.trim();
    if (trimmedCity) {
      f.city = trimmedCity;
    }
    if (selectedTags.length > 0) {
      f.tags = selectedTags.join(",");
    }
    if (sortBy) {
      f.sortBy = sortBy;
      f.orderBy = orderBy;
    }

    return f;
  }, [ageMin, ageMax, popularityMin, popularityMax, location, selectedTags, sortBy, orderBy]);

  const readableSearchError = (err) => {
    const raw = String(err?.message || "");
    if (err?.status === 400) {
      if (raw.includes("must be integers")) {
        return "Les filtres âge/popularité doivent être des nombres.";
      }
      return `Filtres invalides: ${raw}`;
    }
    if (err?.status === 401) {
      return "Session expirée, reconnecte-toi.";
    }
    return raw || "Impossible de charger les résultats.";
  };

  const fetchResults = async (appliedFilters) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getUsersNav(token, appliedFilters);
      const list = Array.isArray(data) ? data : [];
      setResults(list);
    } catch (err) {
      setError(readableSearchError(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = () => {
    fetchResults(filters);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      SEARCH_FILTERS_STORAGE_KEY,
      JSON.stringify({
        ageMin,
        ageMax,
        popularityMin,
        popularityMax,
        location,
        selectedTags,
        sortBy,
        orderBy,
      })
    );
  }, [ageMin, ageMax, popularityMin, popularityMax, location, selectedTags, sortBy, orderBy]);

  const onAgeMinChange = (v) => {
    const next = clamp(Number(v), AGE_MIN, ageMax);
    setAgeMin(next);
  };

  const onAgeMaxChange = (v) => {
    const next = clamp(Number(v), ageMin, AGE_MAX);
    setAgeMax(next);
  };

  const onPopularityMinChange = (v) => {
    const next = clamp(Number(v), POP_MIN, popularityMax);
    setPopularityMin(next);
  };

  const onPopularityMaxChange = (v) => {
    const next = clamp(Number(v), popularityMin, POP_MAX);
    setPopularityMax(next);
  };

  const activeFilters = useMemo(() => {
    const chips = [];
    if (location.trim()) {
      chips.push({
        key: "city",
        label: `Ville: ${location.trim()}`,
        onClear: () => setLocation(""),
      });
    }
    if (selectedTags.length > 0) {
      selectedTags.forEach((tagValue) => {
        const tagLabel = AVAILABLE_TAGS.find((t) => t.value === tagValue)?.label || tagValue;
        chips.push({
          key: `tag-${tagValue}`,
          label: `Tag: ${tagLabel}`,
          onClear: () => setSelectedTags((prev) => prev.filter((t) => t !== tagValue)),
        });
      });
    }
    if (ageMin !== AGE_MIN || ageMax !== AGE_MAX) {
      chips.push({
        key: "age",
        label: `Âge: ${ageMin}-${ageMax}`,
        onClear: () => {
          setAgeMin(AGE_MIN);
          setAgeMax(AGE_MAX);
        },
      });
    }
    if (popularityMin !== POP_MIN || popularityMax !== POP_MAX) {
      chips.push({
        key: "popularity",
        label: `Popularité: ${popularityMin}-${popularityMax}`,
        onClear: () => {
          setPopularityMin(POP_MIN);
          setPopularityMax(POP_MAX);
        },
      });
    }
    if (sortBy) {
      chips.push({
        key: "sort",
        label: `Tri: ${SORT_LABELS[sortBy] || sortBy} (${orderBy === "asc" ? "asc" : "desc"})`,
        onClear: () => {
          setSortBy("");
          setOrderBy("desc");
        },
      });
    }
    return chips;
  }, [location, selectedTags, ageMin, ageMax, popularityMin, popularityMax, sortBy, orderBy]);

  return (
    <div className="recherche-container">
      <div className="recherche-content">
        <div className="recherche">
          <div className="recherche-photo-container">
            <div className="recherche-card-picture">
              <div className="recherche-results-header">
                <h2>Résultats</h2>
                <span>{results.length} profil(s)</span>
              </div>
              {loading && <p>Chargement...</p>}
              {!loading && error && <p style={{ color: "red" }}>{error}</p>}
              {!loading && !error && results.length === 0 && (
                <p>Aucun profil correspondant.</p>
              )}
              {!loading && !error && results.length > 0 && (
                <div className="recherche-results-list">
                  {results.map((u) => (
                    <div key={u.id} className="recherche-result-item">
                      <div>
                        <p className="res-name">{u.firstname || ""} {u.lastname || ""}</p>
                        <p className="res-meta">@{u.username || "unknown"}</p>
                        <p className="res-meta">Popularité: {u.popularity ?? 0}</p>
                        <p className="res-meta">Âge: {u.age ?? "N/A"}</p>
                        <p className="res-meta">Ville: {u.city || "N/A"}</p>
                      </div>
                      <button
                        className="btn-secondary recherche-view-btn"
                        type="button"
                        onClick={() => navigate(`/profile/${u.id}`)}
                      >
                        Voir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="recherche-card-description">
              <h2 className="filter-title">Filtres</h2>
              {activeFilters.length > 0 && (
                <div className="active-filters">
                  {activeFilters.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className="filter-chip"
                      onClick={item.onClear}
                      title="Supprimer ce filtre"
                    >
                      {item.label} ×
                    </button>
                  ))}
                </div>
              )}

              <div className="filter-section">
                <div className="filter-row">
                  <span className="filter-label">Âge</span>
                  <span className="filter-value">{ageMin} – {ageMax}</span>
                </div>

                <div className="range-double">
                  <div className="range-track"></div>

                  <div
                    className="range-fill"
                    style={{
                      left: `${((ageMin - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100}%`,
                      width: `${((ageMax - ageMin) / (AGE_MAX - AGE_MIN)) * 100}%`,
                    }}
                  ></div>

                  <input
                    className={`range range-min ${ageMin > AGE_MAX - 5 ? "on-top" : ""}`}
                    type="range"
                    min={AGE_MIN}
                    max={AGE_MAX}
                    value={ageMin}
                    onChange={(e) => onAgeMinChange(e.target.value)}
                  />

                  <input
                    className={`range range-max ${ageMin <= AGE_MAX - 5 ? "on-top" : ""}`}
                    type="range"
                    min={AGE_MIN}
                    max={AGE_MAX}
                    value={ageMax}
                    onChange={(e) => onAgeMaxChange(e.target.value)}
                  />
                </div>

                <div className="filter-hints">
                  <span>{AGE_MIN}</span>
                  <span>{AGE_MAX}</span>
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-row">
                  <span className="filter-label">Popularité</span>
                  <span className="filter-value">
                    {popularityMin} – {popularityMax}
                  </span>
                </div>

                <div className="range-double">
                  <div className="range-track"></div>

                  <div
                    className="range-fill"
                    style={{
                      left: `${((popularityMin - POP_MIN) / (POP_MAX - POP_MIN)) * 100}%`,
                      width: `${((popularityMax - popularityMin) / (POP_MAX - POP_MIN)) * 100}%`,
                    }}
                  ></div>

                  <input
                    className={`range range-min ${popularityMin > POP_MAX - 20 ? "on-top" : ""}`}
                    type="range"
                    min={POP_MIN}
                    max={POP_MAX}
                    step={1}
                    value={popularityMin}
                    onChange={(e) => onPopularityMinChange(e.target.value)}
                  />

                  <input
                    className={`range range-max ${popularityMin <= POP_MAX - 20 ? "on-top" : ""}`}
                    type="range"
                    min={POP_MIN}
                    max={POP_MAX}
                    step={1}
                    value={popularityMax}
                    onChange={(e) => onPopularityMaxChange(e.target.value)}
                  />
                </div>
                <div className="filter-hints">
                  <span>{POP_MIN}</span>
                  <span>{POP_MAX}</span>
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-row">
                  <span className="filter-label">Ville</span>
                </div>

                <input
                  className="text-input"
                  type="text"
                  placeholder="Ville, code postal…"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="filter-section">
                <div className="filter-row">
                  <span className="filter-label">Tri</span>
                </div>
                <div className="sort-row">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSortBy(value);
                      if (!value) {
                        setOrderBy("desc");
                      }
                    }}
                  >
                    <option value="">Pertinence</option>
                    <option value="age">Âge</option>
                    <option value="popularity">Popularité</option>
                    <option value="city">Localisation</option>
                  </select>
                  <select
                    value={orderBy}
                    disabled={!sortBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                  >
                    <option value="desc">Descendant</option>
                    <option value="asc">Ascendant</option>
                  </select>
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-row">
                  <span className="filter-label">Centres d’intérêt</span>
                </div>

                <div className="tag-grid">
                  {AVAILABLE_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        type="button"
                        className={`tag-pill ${active ? "active" : ""}`}
                        onClick={() => toggleTag(tag.value)}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="filter-actions">
                <button className="btn-secondary" onClick={reset} type="button">
                  Réinitialiser
                </button>
                <button className="btn-primary" onClick={apply} type="button" disabled={loading}>
                  {loading ? "Chargement..." : "Appliquer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recherche;
