const cityFilter = document.querySelector("#lead-city-filter");
const categoryFilter = document.querySelector("#lead-category-filter");
const resetButton = document.querySelector("#lead-filter-reset");
const countDisplay = document.querySelector("#lead-count");
const summary = document.querySelector("#lead-filter-summary");
const emptyState = document.querySelector("#empty-state");
const leadCards = Array.from(
  document.querySelectorAll("#lead-list .lead-card")
);

if (
  cityFilter &&
  categoryFilter &&
  resetButton &&
  countDisplay &&
  summary &&
  emptyState
) {
  const updateLeadList = () => {
    const selectedCity = cityFilter.value;
    const selectedCategory = categoryFilter.value;
    const activeFilters = [];

    if (selectedCity !== "all") activeFilters.push(selectedCity);
    if (selectedCategory !== "all") activeFilters.push(selectedCategory);

    let visibleCount = 0;
    leadCards.forEach(card => {
      const matchesCity =
        selectedCity === "all" || card.dataset.city === selectedCity;
      const matchesCategory =
        selectedCategory === "all" ||
        card.dataset.category === selectedCategory;
      const matchesFilters = matchesCity && matchesCategory;

      card.hidden = !matchesFilters;
      if (matchesFilters) visibleCount += 1;
    });

    countDisplay.textContent = String(visibleCount);
    emptyState.hidden = visibleCount !== 0;
    resetButton.disabled = activeFilters.length === 0;

    if (visibleCount === 0) {
      summary.textContent = activeFilters.length
        ? `Aucun prospect ne correspond aux filtres : ${activeFilters.join(" · ")}.`
        : "Aucun prospect de démonstration n’est disponible.";
      return;
    }

    const noun = visibleCount === 1 ? "prospect" : "prospects";
    const verb = visibleCount === 1 ? "correspond" : "correspondent";
    const filterDescription = activeFilters.length
      ? ` aux filtres : ${activeFilters.join(" · ")}`
      : " au total";
    summary.textContent = `${visibleCount} ${noun} ${verb}${filterDescription}.`;
  };

  cityFilter.addEventListener("change", updateLeadList);
  categoryFilter.addEventListener("change", updateLeadList);
  resetButton.addEventListener("click", () => {
    cityFilter.value = "all";
    categoryFilter.value = "all";
    updateLeadList();
    cityFilter.focus();
  });

  updateLeadList();
}

const demoStore = window.MohamiDemoStore;
const profilePicker = document.querySelector("#demo-lawyer-select");
const leadList = document.querySelector("#lead-list");

if (demoStore && profilePicker && leadList) {
  const profileName = document.querySelector("#demo-lawyer-name");
  const profileStatus = document.querySelector("#demo-lawyer-status");
  const profileStatusLabel = document.querySelector(
    "#demo-lawyer-status-label"
  );
  const profileCity = document.querySelector("#demo-lawyer-city");
  const profileSpecialty = document.querySelector("#demo-lawyer-specialty");
  const profilePlan = document.querySelector("#demo-lawyer-plan");
  const approvalNotice = document.querySelector("#lawyer-approval-notice");
  const filterPanel = document.querySelector("#lead-filters");
  const filterSummary = document.querySelector("#lead-filter-summary");
  const planAction = document.querySelector("#demo-plan-action");
  const homeTotal = document.querySelector("#home-lawyer-total");
  const homePending = document.querySelector("#home-lawyer-pending");
  const homeVerified = document.querySelector("#home-lawyer-verified");
  const homeSubscriptions = document.querySelector("#home-subscription-total");
  const homeStorageStatus = document.querySelector("#home-storage-status");
  const defaultProfileId = "lawyer-casa-business";

  const state = demoStore.getState();
  state.lawyers.forEach(profile => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `Me ${profile.name} — ${profile.city} · ${profile.specialty}`;
    profilePicker.append(option);
  });
  profilePicker.value = state.lawyers.some(
    profile => profile.id === defaultProfileId
  )
    ? defaultProfileId
    : state.lawyers[0]?.id || "";

  function updateHomeStats(profiles) {
    const verifiedCount = profiles.filter(profile => profile.verified).length;
    const activeSubscriptions = profiles.filter(
      profile => profile.verified && profile.subscriptionActive
    ).length;
    if (homeTotal) homeTotal.textContent = String(profiles.length);
    if (homePending) {
      homePending.textContent = String(profiles.length - verifiedCount);
    }
    if (homeVerified) homeVerified.textContent = String(verifiedCount);
    if (homeSubscriptions) {
      homeSubscriptions.textContent = String(activeSubscriptions);
    }
    if (homeStorageStatus) {
      homeStorageStatus.textContent = demoStore.isPersistent()
        ? `État fictif conservé dans le LocalStorage de cette origine (${demoStore.storageKey}); aucune donnée client n’est stockée.`
        : "LocalStorage indisponible : les changements ne survivront pas à la fermeture de cette page.";
    }
  }

  function renderLawyerPreview(nextState = demoStore.getState()) {
    const profiles = nextState.lawyers;
    updateHomeStats(profiles);
    if (!profiles.some(profile => profile.id === profilePicker.value)) {
      profilePicker.value = profiles[0]?.id || "";
    }
    const profile = profiles.find(item => item.id === profilePicker.value);
    if (!profile) return;

    profileName.textContent = profile.name;
    profileCity.textContent = profile.city;
    profileSpecialty.textContent = profile.specialty;
    profileStatusLabel.textContent = profile.verified
      ? "Profil validé"
      : "À valider";
    profileStatus.classList.toggle("profile-status-pending", !profile.verified);
    profileStatus.classList.toggle("profile-status-approved", profile.verified);

    const profileReady = profile.verified;
    approvalNotice.hidden = profileReady;
    filterPanel.hidden = !profileReady;
    filterSummary.hidden = !profileReady;
    leadList.hidden = !profileReady;

    if (!profile.verified) {
      profilePlan.textContent = "Abonnement disponible après validation";
    } else if (profile.subscriptionActive) {
      profilePlan.textContent = "Abonnement démo actif · 300 DH/mois";
    } else {
      profilePlan.textContent = "Abonnement démo inactif · 300 DH/mois";
    }

    leadList.querySelectorAll(".locked-contact").forEach(contact => {
      const title = contact.querySelector("strong");
      const hint = contact.querySelector("small");
      const unlocked = profile.verified && profile.subscriptionActive;
      title.textContent = unlocked
        ? "Accès démo activé"
        : "Coordonnées protégées";
      hint.textContent = unlocked
        ? "Aucune coordonnée réelle n’est enregistrée dans cette maquette."
        : "Les informations restent masquées dans cet aperçu.";
      contact.classList.toggle("demo-contact-active", unlocked);
    });

    leadList.querySelectorAll(".outline-button").forEach(button => {
      button.disabled = !profile.verified || profile.subscriptionActive;
      button.textContent = profile.subscriptionActive
        ? "Abonnement démo actif"
        : "Simuler l’abonnement · 300 DH/mois";
    });
    if (planAction) {
      planAction.disabled = !profile.verified || profile.subscriptionActive;
      planAction.textContent = profile.subscriptionActive
        ? "Abonnement démo actif"
        : profile.verified
          ? "Simuler l’abonnement · 300 DH/mois"
          : "Valider le profil avant l’abonnement";
    }
  }

  function activateSelectedSubscription() {
    const profileId = profilePicker.value;
    const result = demoStore.setSubscriptionActive(profileId, true);
    if (!result.ok) {
      window.alert(result.message);
      return;
    }
    renderLawyerPreview(result.state);
    if (homeStorageStatus) {
      homeStorageStatus.textContent = result.persisted
        ? "Abonnement fictif activé localement; aucun paiement réel n’a été effectué."
        : "Abonnement fictif activé pour cette page seulement; le navigateur n’a pas permis sa persistance.";
    }
  }

  profilePicker.addEventListener("change", () =>
    renderLawyerPreview(demoStore.getState())
  );
  leadList.addEventListener("click", event => {
    if (event.target.closest(".outline-button")) {
      activateSelectedSubscription();
    }
  });
  if (planAction) {
    planAction.addEventListener("click", activateSelectedSubscription);
  }

  demoStore.subscribe(({ state: updatedState }) =>
    renderLawyerPreview(updatedState)
  );
  renderLawyerPreview(state);
}
