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
