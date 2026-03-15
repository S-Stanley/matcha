import "../CSS/Profile.css";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  getUsers,
  getLikesMe,
  getUserById,
  getViewsMe,
  deleteProfilePicture,
  patchCurrentUser,
  patchProfilePicture,
  toggleUserTag,
} from "../api";

const API_URL = "http://127.0.0.1:5000";

const API_TO_GENDER = {
  MALE: "Homme",
  FEMALE: "Femme",
  OTHERS: "Autre",
  "DO NOT PRONONCE": "Ne se prononce pas",
};

const GENDER_TO_API = {
  Homme: "MALE",
  Femme: "FEMALE",
  Autre: "OTHERS",
  "Ne se prononce pas": "DO NOT PRONONCE",
};

const API_TO_PREFERENCE = {
  MALE: "Hommes",
  FEMALE: "Femmes",
  BOTH: "Les deux",
};

const PREFERENCE_TO_API = {
  Hommes: "MALE",
  Femmes: "FEMALE",
  "Les deux": "BOTH",
};

const TAG_OPTIONS = [
  "sport",
  "cinema",
  "musique",
  "voyage",
  "cuisine",
  "jeux",
  "lecture",
  "tech",
];

function Profile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    gender: "",
    sexualPreference: "",
    bio: "",
    tags: [],
    popularity: 42,
    age: null,
    location: {
      city: "",
      gpsEnabled: false,
    },
    photos: [],
  });
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    age: "",
    city: "",
    bio: "",
    gender: "",
    sexualPreference: "",
  });
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [views, setViews] = useState([]);
  const [likes, setLikes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
  const [deletingPictureId, setDeletingPictureId] = useState("");
  const profilePicture = profile.photos[0];
  const getTagsStorageKey = (identity) => `profile_tags_${identity || "me"}`;

  const resolvePictureUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url;
    }
    return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const hydrateProfile = (me) => {
    const backendPictures = Array.isArray(me.pictures)
      ? me.pictures.map((pic) => ({
          id: pic?.id,
          url: pic?.url,
          created_at: pic?.created_at,
        })).filter((pic) => pic.url)
      : [];
    const hydrated = {
      firstName: me.firstname || "",
      lastName: me.lastname || "",
      email: me.email || "",
      username: me.username || "",
      gender: API_TO_GENDER[me.gender] || "Non renseigné",
      sexualPreference: API_TO_PREFERENCE[me.preference] || "Non renseigné",
      bio: me.bio || "",
      tags: (() => {
        const key = getTagsStorageKey(me.username);
        try {
          const stored = localStorage.getItem(key);
          const parsed = stored ? JSON.parse(stored) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          return [];
        }
      })(),
      popularity: me.popularity || 0,
      age: me.age ?? null,
      location: {
        city: me.city || "Non renseignée",
        gpsEnabled: false,
      },
      photos: backendPictures.length > 0
        ? backendPictures
        : (me.picture_url || me.pictureUrl
          ? [{ id: "legacy", url: me.picture_url || me.pictureUrl }]
          : []),
    };
    setProfile(hydrated);
    setEditForm({
      firstName: hydrated.firstName,
      lastName: hydrated.lastName,
      email: hydrated.email,
      username: hydrated.username,
      age: me.age ?? "",
      city: me.city || "",
      bio: hydrated.bio,
      gender: hydrated.gender === "Non renseigné" ? "" : hydrated.gender,
      sexualPreference: hydrated.sexualPreference === "Non renseigné" ? "" : hydrated.sexualPreference,
    });
  };

  const getLikeUserId = (entry) => {
    if (!entry) return null;
    if (Array.isArray(entry)) {
      if (entry.length >= 2) return entry[1];
      if (entry.length === 1 && typeof entry[0] === "string") {
        const m = entry[0].match(/\(([^,]+),([^)]+)\)/);
        return m?.[2] || null;
      }
    }
    if (typeof entry === "string") {
      const m = entry.match(/\(([^,]+),([^)]+)\)/);
      return m?.[2] || null;
    }
    if (entry.liked_by) return entry.liked_by;
    if (entry.likedBy) return entry.likedBy;
    return null;
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Non connecté.");
        setLoading(false);
        return;
      }

      try {
        const [me, rawViews, rawLikes, users] = await Promise.all([
          getCurrentUser(token),
          getViewsMe(token).catch(() => []),
          getLikesMe(token).catch(() => []),
          getUsers(token).catch(() => []),
        ]);
        const usersMap = {};
        (Array.isArray(users) ? users : []).forEach((u) => {
          usersMap[String(u.id)] = u;
        });

        hydrateProfile(me);

        const parsedViews = (Array.isArray(rawViews) ? rawViews : []).map((row) => ({
          id: row?.[0] || null,
          username: row?.[2] || "unknown",
          firstname: row?.[4] || "",
          lastname: row?.[3] || "",
        }));
        setViews(parsedViews);

        const likerIds = (Array.isArray(rawLikes) ? rawLikes : [])
          .map(getLikeUserId)
          .filter(Boolean);

        if (likerIds.length > 0) {
          const likerProfiles = await Promise.all(
            likerIds.map((id) =>
              getUserById(token, id).catch(() => usersMap[String(id)] || {
                id,
                username: "unknown",
                firstname: "",
                lastname: "",
              })
            )
          );
          setLikes(likerProfiles);
        } else {
          setLikes([]);
        }
      } catch (err) {
        setError(err?.message || "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (newPhotoFiles.length === 0) {
      setNewPhotoPreviews([]);
      return;
    }
    const objectUrls = newPhotoFiles.map((file) => URL.createObjectURL(file));
    setNewPhotoPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [newPhotoFiles]);

  const requestGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n’est pas supportée");
      return;
    }

    const reverseGeocodeCity = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        if (!response.ok) {
          return "";
        }
        const data = await response.json();
        const address = data?.address || {};
        return (
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.county ||
          address.state ||
          ""
        );
      } catch (_) {
        return "";
      }
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const city = await reverseGeocodeCity(latitude, longitude);
        const gpsLabel = city || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setProfile((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            gpsEnabled: true,
            city: gpsLabel,
          },
        }));
        if (isEditing) {
          setEditForm((prev) => ({ ...prev, city: gpsLabel }));
        }
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const me = await getCurrentUser(token);
          await patchCurrentUser(token, {
            email: me.email || "",
            firstname: me.firstname || "",
            lastname: me.lastname || "",
            username: me.username || "",
            bio: me.bio || "",
            gender: me.gender || "",
            preference: me.preference || "",
            city: gpsLabel,
          });
        } catch (err) {
          setError(err?.message || "Impossible de sauvegarder la localisation.");
        }
      },
      () => {
        alert("Autorisation GPS refusée");
      }
    );
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 5 - profile.photos.length - newPhotoFiles.length;
    if (remaining <= 0) {
      setError("Maximum 5 photos.");
      return;
    }
    if (files.length > remaining) {
      setError(`Tu peux ajouter encore ${remaining} photo(s) maximum.`);
      return;
    }
    setError("");
    setNewPhotoFiles((prev) => [...prev, ...files]);
  };

  const removePendingPhoto = (indexToRemove) => {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const deleteExistingPhoto = async (pictureId) => {
    const token = localStorage.getItem("token");
    if (!token || !pictureId) return;
    setDeletingPictureId(String(pictureId));
    setError("");
    try {
      await deleteProfilePicture(token, pictureId);
      setProfile((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => String(p.id) !== String(pictureId)),
      }));
    } catch (err) {
      setError(err?.message || "Impossible de supprimer la photo.");
    } finally {
      setDeletingPictureId("");
    }
  };

  const handleToggleTag = async (tag) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await toggleUserTag(token, tag);
      setProfile((prev) => {
        const hasTag = prev.tags.includes(tag);
        const updatedTags = hasTag ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag];
        const key = getTagsStorageKey(prev.username);
        localStorage.setItem(key, JSON.stringify(updatedTags));
        return { ...prev, tags: updatedTags };
      });
    } catch (err) {
      setError(err?.message || "Impossible de mettre à jour les tags.");
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNewPhotoFiles([]);
    setEditForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      username: profile.username,
      age: profile.age ?? "",
      city: profile.location.city === "Non renseignée" ? "" : profile.location.city,
      bio: profile.bio,
      gender: profile.gender === "Non renseigné" ? "" : profile.gender,
      sexualPreference: profile.sexualPreference === "Non renseigné" ? "" : profile.sexualPreference,
    });
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session invalide.");
      return;
    }
    if (!editForm.gender || !editForm.sexualPreference) {
      setError("Genre et préférence sont requis.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        email: editForm.email.trim(),
        firstname: editForm.firstName.trim(),
        lastname: editForm.lastName.trim(),
        username: editForm.username.trim(),
        city: editForm.city.trim(),
        bio: editForm.bio,
        gender: GENDER_TO_API[editForm.gender],
        preference: PREFERENCE_TO_API[editForm.sexualPreference],
      };
      const normalizedAge = String(editForm.age ?? "").trim();
      if (normalizedAge !== "") {
        payload.age = normalizedAge;
      }

      await patchCurrentUser(token, payload);

      if (newPhotoFiles.length > 0) {
        for (const file of newPhotoFiles) {
          // Backend currently accepts one file per request.
          // We send them sequentially to create up to 5 pictures.
          await patchProfilePicture(token, file);
        }
      }

      const me = await getCurrentUser(token);
      hydrateProfile(me);
      setIsEditing(false);
      setNewPhotoFiles([]);
    } catch (err) {
      setError(err?.message || "Impossible de sauvegarder le profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="myprofile-container">
      <div className="myprofile-content">
        {loading && <p>Chargement du profil...</p>}
        {!loading && error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <div className="myprofile">
            <div className="photo-container">
              <div className="myprofile-card-picture">
                {profilePicture ? (
                  <img src={resolvePictureUrl(profilePicture.url)} alt="Photo de profil" />
                ) : newPhotoPreviews[0] ? (
                  <img src={newPhotoPreviews[0]} alt="Nouvelle photo de profil" />
                ) : (
                  <p>PHOTO DE PROFIL</p>
                )}
              </div>
              <div className="profile-photos-grid">
                {profile.photos.map((photo) => (
                  <div key={String(photo.id)} className="profile-photo-thumb">
                    <img src={resolvePictureUrl(photo.url)} alt="Photo" />
                    {isEditing && (
                      <button
                        type="button"
                        className="profile-photo-delete"
                        onClick={() => deleteExistingPhoto(photo.id)}
                        disabled={deletingPictureId === String(photo.id)}
                      >
                        {deletingPictureId === String(photo.id) ? "..." : "×"}
                      </button>
                    )}
                  </div>
                ))}
                {isEditing &&
                  newPhotoPreviews.map((src, i) => (
                    <div key={`new-${i}`} className="profile-photo-thumb pending">
                      <img src={src} alt="Nouvelle photo" />
                      <button
                        type="button"
                        className="profile-photo-delete"
                        onClick={() => removePendingPhoto(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
              {isEditing && (
                <label className="profile-photo-upload">
                  Ajouter des photos ({profile.photos.length + newPhotoFiles.length}/5)
                  <input type="file" multiple accept="image/*" onChange={handleAddPhotos} />
                </label>
              )}
            </div>

            <div className="myprofile-card-description">
              {!isEditing && (
                <>
                  <h2>
                    {profile.firstName} {profile.lastName}
                  </h2>

                  <p className="popularity">⭐ Popularité : {profile.popularity}</p>
                  <p>
                    <strong>Genre :</strong> {profile.gender}
                  </p>
                  <p>
                    <strong>Préférences :</strong> {profile.sexualPreference}
                  </p>
                  <p>
                    <strong>Email :</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Username :</strong> @{profile.username || "unknown"}
                  </p>
                  <p>
                    <strong>Âge :</strong> {profile.age ?? "Non renseigné"}
                  </p>
                  <p>
                    <strong>Localisation :</strong> {profile.location.city}
                  </p>

                  <p className="bio">{profile.bio || "Aucune bio renseignée."}</p>

                  <div className="tags">
                    {profile.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="location">
                    {!profile.location.gpsEnabled && (
                      <button onClick={requestGPSLocation}>Activer GPS</button>
                    )}
                  </div>

                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    Modifier le profil
                  </button>
                </>
              )}

              {isEditing && (
                <div className="profile-edit-form">
                  <h2>Modifier mon profil</h2>
                  <div className="profile-edit-grid">
                    <label>
                      Prénom
                      <input
                        value={editForm.firstName}
                        onChange={(e) => handleEditChange("firstName", e.target.value)}
                      />
                    </label>
                    <label>
                      Nom
                      <input
                        value={editForm.lastName}
                        onChange={(e) => handleEditChange("lastName", e.target.value)}
                      />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditChange("email", e.target.value)}
                      />
                    </label>
                    <label>
                      Username
                      <input
                        value={editForm.username}
                        onChange={(e) => handleEditChange("username", e.target.value)}
                      />
                    </label>
                    <label>
                      Âge
                      <input
                        type="number"
                        min={18}
                        max={120}
                        value={editForm.age}
                        onChange={(e) => handleEditChange("age", e.target.value)}
                      />
                    </label>
                    <label>
                      Genre
                      <select
                        value={editForm.gender}
                        onChange={(e) => handleEditChange("gender", e.target.value)}
                      >
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Autre">Autre</option>
                        <option value="Ne se prononce pas">Ne se prononce pas</option>
                      </select>
                    </label>
                    <label>
                      Préférences
                      <select
                        value={editForm.sexualPreference}
                        onChange={(e) => handleEditChange("sexualPreference", e.target.value)}
                      >
                        <option value="Hommes">Hommes</option>
                        <option value="Femmes">Femmes</option>
                        <option value="Les deux">Les deux</option>
                      </select>
                    </label>
                    <label className="profile-edit-full">
                      Ville
                      <input
                        value={editForm.city}
                        onChange={(e) => handleEditChange("city", e.target.value)}
                      />
                    </label>
                    <label className="profile-edit-full">
                      Bio
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => handleEditChange("bio", e.target.value)}
                        rows={5}
                      />
                    </label>
                    <div className="profile-edit-full">
                      <p className="tags-title">Centres d’intérêt</p>
                      <div className="tags-select-grid">
                        {TAG_OPTIONS.map((tag) => {
                          const active = profile.tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              className={`tag-select-btn ${active ? "active" : ""}`}
                              onClick={() => handleToggleTag(tag)}
                            >
                              #{tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="profile-edit-actions">
                    <button className="secondary-btn" onClick={cancelEdit} disabled={saving}>
                      Annuler
                    </button>
                    <button className="edit-profile-btn" onClick={saveProfile} disabled={saving}>
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="myprofile-stats">
              <h3>Activité</h3>

              <div>
                <strong>Consultations :</strong>
                <ul>
                  {views.length === 0 && <li>Aucune consultation pour le moment.</li>}
                  {views.map((view, i) => (
                    <li key={i}>
                      {view.firstname || view.lastname
                        ? `${view.firstname} ${view.lastname}`.trim()
                        : `@${view.username}`}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Likes reçus :</strong>
                <ul>
                  {likes.length === 0 && <li>Aucun like reçu pour le moment.</li>}
                  {likes.map((like, i) => (
                    <li key={i}>
                      {like.firstname || like.lastname
                        ? `${like.firstname} ${like.lastname}`.trim()
                        : `@${like.username || "unknown"}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
