(() => {
  const store = window.MohamiDemoStore;
  const tableBody = document.querySelector("#admin-lawyer-rows");
  if (!store || !tableBody) return;

  const elements = {
    total: document.querySelector("#stat-total-lawyers"),
    verified: document.querySelector("#stat-verified-lawyers"),
    pending: document.querySelector("#stat-pending-lawyers"),
    subscriptions: document.querySelector("#stat-active-subscriptions"),
    monthlyAmount: document.querySelector("#stat-monthly-amount"),
    resultCount: document.querySelector("#admin-result-count"),
    emptyState: document.querySelector("#admin-empty-state"),
    storageStatus: document.querySelector("#admin-storage-status"),
    actionStatus: document.querySelector("#admin-action-status"),
    search: document.querySelector("#admin-search"),
    cityFilter: document.querySelector("#admin-city-filter"),
    statusFilter: document.querySelector("#admin-status-filter"),
    resetFilters: document.querySelector("#admin-reset-filters"),
    resetDemo: document.querySelector("#admin-reset-demo"),
  };

  const numberFormat = new Intl.NumberFormat("fr-MA");

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function makeStatus(text, className) {
    return makeElement("span", `status ${className}`, text);
  }

  function renderStats(state) {
    const verified = state.lawyers.filter(profile => profile.verified).length;
    const pending = state.lawyers.length - verified;
    const active = state.lawyers.filter(
      profile => profile.verified && profile.subscriptionActive
    ).length;

    elements.total.textContent = String(state.lawyers.length);
    elements.verified.textContent = String(verified);
    elements.pending.textContent = String(pending);
    elements.subscriptions.textContent = String(active);
    elements.monthlyAmount.textContent = `${numberFormat.format(active * 300)} DH`;

    const persistent = store.isPersistent();
    elements.storageStatus.textContent = persistent
      ? `Données de démonstration enregistrées dans ce navigateur · clé « ${store.storageKey} ».`
      : "LocalStorage indisponible : les changements resteront temporaires jusqu’à la fermeture de cette page.";
    elements.storageStatus.classList.toggle("is-warning", !persistent);
  }

  function createProfileRow(profile) {
    const row = document.createElement("tr");

    const identityCell = document.createElement("td");
    const identity = makeElement("div", "admin-profile-identity");
    const avatar = makeElement(
      "span",
      "admin-table-avatar",
      profile.name
        .split(" ")
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase()
    );
    const nameBlock = makeElement("div", "admin-name-block");
    nameBlock.append(
      makeElement("strong", "", profile.name),
      makeElement(
        "small",
        "",
        `Profil fictif · inscrit le ${profile.registeredOn}`
      )
    );
    identity.append(avatar, nameBlock);
    identityCell.append(identity);

    const targetingCell = document.createElement("td");
    targetingCell.append(
      makeElement("strong", "", profile.city),
      makeElement("small", "", profile.specialty)
    );

    const verificationCell = document.createElement("td");
    verificationCell.append(
      profile.verified
        ? makeStatus("Profil validé", "status-approved")
        : makeStatus("À valider", "status-pending")
    );

    const subscriptionCell = document.createElement("td");
    if (!profile.verified) {
      subscriptionCell.append(makeStatus("Après validation", "status-off"));
    } else if (profile.subscriptionActive) {
      subscriptionCell.append(makeStatus("Démo active", "status-on"));
    } else {
      subscriptionCell.append(makeStatus("Inactif", "status-off"));
    }

    const actionsCell = document.createElement("td");
    const actions = makeElement("div", "admin-row-actions");
    if (!profile.verified) {
      const verifyButton = makeElement(
        "button",
        "admin-action-button admin-action-approve",
        "Valider le profil"
      );
      verifyButton.type = "button";
      verifyButton.dataset.action = "verify";
      verifyButton.dataset.profileId = profile.id;
      actions.append(verifyButton);
    } else {
      const subscriptionButton = makeElement(
        "button",
        profile.subscriptionActive
          ? "admin-action-button admin-action-reset"
          : "admin-action-button admin-action-subscribe",
        profile.subscriptionActive
          ? "Désactiver la simulation"
          : "Simuler l’abonnement · 300 DH/mois"
      );
      subscriptionButton.type = "button";
      subscriptionButton.dataset.action = profile.subscriptionActive
        ? "subscription-off"
        : "subscription-on";
      subscriptionButton.dataset.profileId = profile.id;
      actions.append(subscriptionButton);
    }
    actionsCell.append(actions);
    row.append(
      identityCell,
      targetingCell,
      verificationCell,
      subscriptionCell,
      actionsCell
    );
    return row;
  }

  function render(state = store.getState()) {
    renderStats(state);

    const query = elements.search.value.trim().toLocaleLowerCase("fr-MA");
    const selectedCity = elements.cityFilter.value;
    const selectedStatus = elements.statusFilter.value;
    const filteredProfiles = state.lawyers.filter(profile => {
      const matchesQuery =
        !query ||
        `${profile.name} ${profile.city} ${profile.specialty}`
          .toLocaleLowerCase("fr-MA")
          .includes(query);
      const matchesCity =
        selectedCity === "all" || profile.city === selectedCity;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "pending" && !profile.verified) ||
        (selectedStatus === "verified" && profile.verified) ||
        (selectedStatus === "subscribed" && profile.subscriptionActive);
      return matchesQuery && matchesCity && matchesStatus;
    });

    tableBody.replaceChildren(
      ...filteredProfiles.map(profile => createProfileRow(profile))
    );
    elements.emptyState.hidden = filteredProfiles.length !== 0;
    elements.resultCount.textContent = `${filteredProfiles.length} profil${filteredProfiles.length === 1 ? "" : "s"} affiché${filteredProfiles.length === 1 ? "" : "s"}`;
  }

  function announce(
    message,
    persisted = store.isPersistent(),
    isError = false
  ) {
    elements.actionStatus.textContent = persisted
      ? message
      : `${message} (non conservé : LocalStorage indisponible)`;
    elements.actionStatus.classList.toggle("is-error", isError);
  }

  tableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const profileId = button.dataset.profileId;
    let result;
    if (button.dataset.action === "verify") {
      result = store.setLawyerVerified(profileId, true);
      if (result.ok) {
        announce(
          "Profil validé dans la maquette. Il peut maintenant recevoir le fil de démonstration.",
          result.persisted
        );
      }
    } else if (button.dataset.action === "subscription-on") {
      result = store.setSubscriptionActive(profileId, true);
      if (result.ok) {
        announce(
          "Abonnement de démonstration activé à 300 DH/mois. Aucun paiement réel n’a été effectué.",
          result.persisted
        );
      }
    } else if (button.dataset.action === "subscription-off") {
      result = store.setSubscriptionActive(profileId, false);
      if (result.ok) {
        announce(
          "Abonnement de démonstration désactivé; aucun remboursement n’a lieu.",
          result.persisted
        );
      }
    }

    if (result && !result.ok) announce(result.message, false, true);
    render(result?.state || store.getState());
  });

  [elements.search, elements.cityFilter, elements.statusFilter].forEach(
    control => {
      control.addEventListener("input", () => render());
      control.addEventListener("change", () => render());
    }
  );

  elements.resetFilters.addEventListener("click", () => {
    elements.search.value = "";
    elements.cityFilter.value = "all";
    elements.statusFilter.value = "all";
    render();
    elements.search.focus();
  });

  elements.resetDemo.addEventListener("click", () => {
    if (
      !window.confirm(
        "Réinitialiser les quatre profils fictifs et leurs abonnements de démonstration ?"
      )
    )
      return;
    const result = store.resetDemo();
    render(result.state);
    announce(
      "La maquette a été réinitialisée avec les profils fictifs de départ.",
      result.persisted
    );
  });

  store.subscribe(({ state }) => render(state));
  render(store.getState());
})();
