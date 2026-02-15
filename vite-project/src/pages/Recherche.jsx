import "../CSS/Recherche.css";
import { useMemo, useState } from "react";

const AGE_MIN = 18;
const AGE_MAX = 99;

const AVAILABLE_TAGS = [
  "Sport",
  "Voyage",
  "Musique",
  "Cinéma",
  "Jeux vidéo",
  "Cuisine",
  "Lecture",
  "Art",
  "Randonnée",
  "Tech",
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Recherche() {
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(99);

  const [popularity, setPopularity] = useState(3);

  const [location, setLocation] = useState("");

  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const reset = () => {
    setAgeMin(18);
    setAgeMax(99);
    setPopularity(3);
    setLocation("");
    setSelectedTags([]);
  };

  const filters = useMemo(() => {
    const f = {
      popularity,
    };

    if (ageMin !== 18 || ageMax !== 99) f.age = { min: ageMin, max: ageMax };
    if (location.trim()) f.location = location.trim();
    if (selectedTags.length > 0) f.tags = selectedTags;

    return f;
  }, [ageMin, ageMax, popularity, location, selectedTags]);

  const apply = () => {
    console.log("APPLY FILTERS:", filters);
  };

  const onAgeMinChange = (v) => {
    const next = clamp(Number(v), AGE_MIN, ageMax);
    setAgeMin(next);
  };

  const onAgeMaxChange = (v) => {
    const next = clamp(Number(v), ageMin, AGE_MAX);
    setAgeMax(next);
  };

  return (
    <div className="recherche-container">
        <div className="recherche-content">
            <div className="recherche">
                <div className="recherche-photo-container">
                    <div className="recherche-card-picture">
                        <p>PHOTO</p>
                    </div>

                    <div className="recherche-card-description">
                        <h2 className="filter-title">Filtres</h2>

                        {/* ÂGE */}
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

                        {/* POPULARITÉ */}
                        <div className="filter-section">
                            <div className="filter-row">
                                <span className="filter-label">Popularité</span>
                                <span className="filter-value">{popularity}/5</span>
                            </div>

                            <div className="range-single">
                                <div className="range-track"></div>
                            <div
                            className="range-fill"
                                style={{
                                    width: `${((popularity - 1) / (5 - 1)) * 100}%`,
                                    left: "0%",
                                }}
                            ></div>

                            <input
                                className="range"
                                type="range"
                                min={1}
                                max={5}
                                step={1}
                                value={popularity}
                                onChange={(e) => setPopularity(Number(e.target.value))}
                                />
                            </div>

                            <div className="filter-hints">
                                <span>1</span>
                                <span>5</span>
                            </div>
                        </div>


                        {/* LOCALISATION */}
                        <div className="filter-section">
                            <div className="filter-row">
                            <span className="filter-label">Localisation</span>
                            </div>

                            <input
                            className="text-input"
                            type="text"
                            placeholder="Ville, code postal… (optionnel)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        {/* TAGS FIXES */}
                        <div className="filter-section">
                            <div className="filter-row">
                            <span className="filter-label">Centres d’intérêt</span>
                            </div>

                            <div className="tag-grid">
                            {AVAILABLE_TAGS.map((tag) => {
                                const active = selectedTags.includes(tag);
                                return (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`tag-pill ${active ? "active" : ""}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                                );
                            })}
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="filter-actions">
                            <button className="btn-secondary" onClick={reset} type="button">
                            Réinitialiser
                            </button>
                            <button className="btn-primary" onClick={apply} type="button">
                            Appliquer
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
