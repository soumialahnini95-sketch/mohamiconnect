(() => {
  const STORAGE_KEY = "mohamiconnect.demo-state.v1";
  const CHANGE_EVENT = "mohamiconnect:demo-state-change";
  const DEFAULT_STATE = {
    version: 1,
    lawyers: [
      {
        id: "lawyer-casa-business",
        name: "Nadia El Idrissi",
        city: "Casablanca",
        specialty: "Droit des affaires",
        verified: false,
        subscriptionActive: false,
        registeredOn: "2026-11-10",
      },
      {
        id: "lawyer-rabat-labor",
        name: "Omar Bennani",
        city: "Rabat",
        specialty: "Droit du travail",
        verified: true,
        subscriptionActive: false,
        registeredOn: "2026-11-08",
      },
      {
        id: "lawyer-marrakech-family",
        name: "Salma Amrani",
        city: "Marrakech",
        specialty: "Droit de la famille / Divorce",
        verified: true,
        subscriptionActive: true,
        registeredOn: "2026-11-03",
      },
      {
        id: "lawyer-tanger-realestate",
        name: "Youssef Alaoui",
        city: "Tanger",
        specialty: "Immobilier",
        verified: false,
        subscriptionActive: false,
        registeredOn: "2026-11-14",
      },
    ],
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  let memoryState = clone(DEFAULT_STATE);
  let persistenceAvailable = true;
  let memoryDirty = false;

  function normalizeState(candidate) {
    const savedLawyers = Array.isArray(candidate?.lawyers)
      ? candidate.lawyers
      : [];
    const savedById = new Map(
      savedLawyers
        .filter(profile => profile && typeof profile.id === "string")
        .map(profile => [profile.id, profile])
    );

    return {
      version: 1,
      lawyers: DEFAULT_STATE.lawyers.map(defaultProfile => {
        const saved = savedById.get(defaultProfile.id);
        const verified = saved?.verified === true;
        return {
          ...defaultProfile,
          verified,
          subscriptionActive: verified && saved?.subscriptionActive === true,
        };
      }),
    };
  }

  function dispatchChange(persisted) {
    window.dispatchEvent(
      new window.CustomEvent(CHANGE_EVENT, {
        detail: { state: clone(memoryState), persisted },
      })
    );
  }

  function saveState(candidate, notify = true) {
    memoryState = normalizeState(candidate);
    let persisted = false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
      persistenceAvailable = true;
      memoryDirty = false;
      persisted = true;
    } catch {
      persistenceAvailable = false;
      memoryDirty = true;
    }

    if (notify) dispatchChange(persisted);
    return { ok: true, state: clone(memoryState), persisted };
  }

  function getState() {
    if (memoryDirty) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
        persistenceAvailable = true;
        memoryDirty = false;
      } catch {
        persistenceAvailable = false;
      }
      return clone(memoryState);
    }

    let raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      persistenceAvailable = true;
    } catch {
      persistenceAvailable = false;
      return clone(memoryState);
    }

    if (raw === null) {
      const initial = saveState(DEFAULT_STATE, false);
      return initial.state;
    }

    try {
      memoryState = normalizeState(JSON.parse(raw));
      return clone(memoryState);
    } catch {
      return saveState(DEFAULT_STATE, false).state;
    }
  }

  function setLawyerVerified(profileId, verified = true) {
    const state = getState();
    const profile = state.lawyers.find(item => item.id === profileId);
    if (!profile) {
      return { ok: false, message: "Profil de démonstration introuvable." };
    }

    profile.verified = verified === true;
    if (!profile.verified) profile.subscriptionActive = false;
    return saveState(state);
  }

  function setSubscriptionActive(profileId, active) {
    const state = getState();
    const profile = state.lawyers.find(item => item.id === profileId);
    if (!profile) {
      return { ok: false, message: "Profil de démonstration introuvable." };
    }
    if (active && !profile.verified) {
      return {
        ok: false,
        message: "Validez le profil avant de simuler l’abonnement.",
        state,
      };
    }

    profile.subscriptionActive = active === true;
    return saveState(state);
  }

  function resetDemo() {
    return saveState(DEFAULT_STATE);
  }

  function subscribe(listener) {
    const handleCustomEvent = event => {
      listener(
        event.detail || {
          state: getState(),
          persisted: persistenceAvailable,
        }
      );
    };
    const handleStorageEvent = event => {
      if (event.key === STORAGE_KEY || event.key === null) {
        listener({ state: getState(), persisted: persistenceAvailable });
      }
    };

    window.addEventListener(CHANGE_EVENT, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }

  window.MohamiDemoStore = Object.freeze({
    storageKey: STORAGE_KEY,
    getState,
    isPersistent: () => {
      getState();
      return persistenceAvailable;
    },
    setLawyerVerified,
    setSubscriptionActive,
    resetDemo,
    subscribe,
  });
})();
