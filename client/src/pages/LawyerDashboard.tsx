import { useState, type FormEvent } from "react";
import { ArrowRight, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, Clock3, FileText, LockKeyhole, LogOut, MapPin, RefreshCw, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CITIES, LEGAL_CATEGORIES, type City, type LegalCategory } from "@shared/legal";

function BrandMark() {
  return <span className="brand-lockup"><span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none"><path d="M7 36V21.2C7 12.82 13.72 6 22 6s15 6.82 15 15.2V36" stroke="currentColor" strokeWidth="2.2" /><path d="M13 36V22a9 9 0 0 1 18 0v14M4 36h36M22 13v16m-7-8h14m-10.5 0-4 6h8l-4-6Zm7 0-4 6h8l-4-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span className="brand-name">Mohami<span>Connect</span></span></span>;
}

function LoginGate() {
  return (
    <main className="lawyer-login-page">
      <header className="site-header dashboard-header"><a className="brand-home" href="/"><BrandMark /></a><a className="text-link" href="/">Retour au site <ArrowRight size={15} /></a></header>
      <section className="login-panel">
        <span className="login-icon"><BriefcaseBusiness size={24} /></span>
        <span className="section-kicker">ESPACE PROFESSIONNEL</span>
        <h1>Votre expertise mérite d’être trouvée.</h1>
        <p>Connectez-vous avec votre compte Manus pour configurer votre profil avocat et consulter les demandes qui correspondent à votre pratique.</p>
        <button className="submit-button" onClick={() => startLogin()}>Se connecter avec Manus <ArrowRight size={17} /></button>
        <div className="login-privacy"><ShieldCheck size={15} /> Connexion sécurisée · Accès réservé aux comptes connectés</div>
      </section>
    </main>
  );
}

function ProfileSetup({ onSave, isSaving }: { onSave: (city: City, specialty: LegalCategory) => void; isSaving: boolean }) {
  const [city, setCity] = useState<City>("Casablanca");
  const [specialty, setSpecialty] = useState<LegalCategory>(LEGAL_CATEGORIES[0]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(city, specialty);
  };

  return (
    <section className="profile-setup-card">
      <div className="setup-illustration"><span><MapPin size={25} /></span><span className="setup-dot setup-dot-one" /><span className="setup-dot setup-dot-two" /></div>
      <div className="setup-content">
        <span className="section-kicker">VOTRE ESPACE, VOTRE CIBLAGE</span>
        <h2>Commençons par votre pratique.</h2>
        <p>Choisissez votre ville et votre spécialité pour voir les dossiers les plus pertinents pour votre cabinet.</p>
        <form className="profile-form" onSubmit={submit}>
          <label className="field-group"><span>Ville d’exercice</span><span className="select-wrap"><select value={city} onChange={event => setCity(event.target.value as City)}>{CITIES.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></span></label>
          <label className="field-group"><span>Votre spécialité</span><span className="select-wrap"><select value={specialty} onChange={event => setSpecialty(event.target.value as LegalCategory)}>{LEGAL_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></span></label>
          <button className="submit-button" disabled={isSaving}>{isSaving ? "Enregistrement…" : <>Enregistrer mon profil <ArrowRight size={16} /></>}</button>
        </form>
      </div>
    </section>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export default function LawyerDashboard() {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const dashboard = trpc.lawyer.dashboard.useQuery(undefined, {
    enabled: auth.isAuthenticated,
    refetchInterval: 4_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const savePreferences = trpc.lawyer.savePreferences.useMutation({
    onSuccess: async () => {
      await utils.lawyer.dashboard.invalidate();
      toast.success("Votre profil et votre ciblage ont été enregistrés.");
    },
    onError: error => toast.error(error.message),
  });
  const activateDemo = trpc.lawyer.activateDemoSubscription.useMutation({
    onSuccess: async () => {
      await utils.lawyer.dashboard.invalidate();
      setPlanDialog(false);
      toast.success("Accès démo activé. Aucun paiement n’a été effectué.");
    },
    onError: error => toast.error(error.message),
  });
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [planDialog, setPlanDialog] = useState(false);
  const profile = dashboard.data?.profile;
  const leads = dashboard.data?.leads ?? [];

  if (auth.loading || (auth.isAuthenticated && dashboard.isLoading)) {
    return <div className="loading-page"><span className="button-spinner" /><span>Préparation de votre espace…</span></div>;
  }
  if (!auth.isAuthenticated) return <LoginGate />;

  const submitPreferences = (city: City, specialty: LegalCategory) => savePreferences.mutate({ city, specialty });
  const activate = () => activateDemo.mutate();

  return (
    <div className="dashboard-page">
      <header className="site-header dashboard-header">
        <a className="brand-home" href="/"><BrandMark /></a>
        <div className="dashboard-header-right">
          {auth.user?.role === "admin" && <a className="admin-header-link" href="/admin/avocats">Valider les profils</a>}
          {profile && <span className="live-status"><span className="live-dot" /> Flux en direct</span>}
          <span className="lawyer-avatar"><UserRound size={16} /></span>
          <span className="lawyer-name">{auth.user?.name || "Espace avocat"}</span>
          <button className="logout-button" title="Se déconnecter" onClick={() => auth.logout()}><LogOut size={16} /><span>Quitter</span></button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-eyebrow"><span className="section-kicker">VOTRE ESPACE PROFESSIONNEL</span><span className="breadcrumb">MohamiConnect <span>/</span> Tableau de bord</span></div>
        <div className="dashboard-heading">
          <div><h1>Bonjour{auth.user?.name ? `, ${auth.user.name.split(" ")[0]}` : ""}.</h1><p>Les demandes pertinentes pour votre pratique, réunies ici.</p></div>
          {profile && <button className="outline-button" onClick={() => setEditingPreferences(value => !value)}>{editingPreferences ? "Fermer les préférences" : "Modifier mon ciblage"}</button>}
        </div>

        {dashboard.error && <div className="inline-error" role="alert"><span>Impossible de charger le tableau de bord pour le moment.</span><button onClick={() => dashboard.refetch()}>Réessayer <RefreshCw size={14} /></button></div>}

        {!profile && !dashboard.isLoading && <ProfileSetup onSave={submitPreferences} isSaving={savePreferences.isPending} />}

        {profile && !profile.verified && auth.user?.role !== "admin" && <section className="verification-wait"><span><Clock3 size={17}/></span><div><span className="section-kicker">VALIDATION DU PROFIL</span><h2>Votre accès est en cours de vérification.</h2><p>Les demandes et coordonnées clients resteront masquées jusqu’à la validation de votre statut professionnel par l’administration MohamiConnect.</p></div></section>}

        {profile && (profile.verified || auth.user?.role === "admin") && <>
          {editingPreferences && <section className="preferences-panel"><div className="preferences-title"><div><span className="section-kicker">VOTRE CIBLAGE</span><h2>Des dossiers adaptés à votre pratique.</h2></div><span className="preference-icon"><MapPin size={17} /></span></div><ProfileSetup onSave={submitPreferences} isSaving={savePreferences.isPending} /></section>}
          <section className="dashboard-summary">
            <div className="summary-card"><span className="summary-icon"><FileText size={18} /></span><div><span className="summary-label">Dossiers correspondants</span><strong>{leads.length}</strong></div><span className="summary-foot">dans votre fil</span></div>
            <div className="summary-card"><span className="summary-icon"><MapPin size={18} /></span><div><span className="summary-label">Ville ciblée</span><strong className="summary-text">{profile.city}</strong></div><span className="summary-foot">votre secteur</span></div>
            <div className="summary-card"><span className="summary-icon"><BriefcaseBusiness size={18} /></span><div><span className="summary-label">Spécialité</span><strong className="summary-text summary-specialty">{profile.specialty}</strong></div><span className="summary-foot">votre domaine</span></div>
          </section>

          <section className="lead-feed-section" aria-labelledby="feed-title">
            <div className="feed-heading"><div><span className="section-kicker">NOUVELLES OPPORTUNITÉS</span><h2 id="feed-title">Demandes récentes <span className="feed-count">{leads.length}</span></h2></div><span className="feed-refresh"><span className="live-dot" /> Actualisation automatique</span></div>
            {dashboard.isFetching && !dashboard.isLoading && <div className="sync-line"><span /> Mise à jour du fil</div>}
            {dashboard.isLoading ? <div className="empty-state"><span className="button-spinner" /><p>Chargement des demandes…</p></div> : leads.length === 0 ? (
              <div className="empty-state"><span className="empty-icon"><FileText size={22} /></span><h3>Votre prochain dossier peut arriver ici.</h3><p>Aucune demande ne correspond encore à <strong>{profile.specialty}</strong> à <strong>{profile.city}</strong>. Les nouvelles demandes apparaîtront automatiquement.</p><button className="text-refresh" onClick={() => dashboard.refetch()}><RefreshCw size={14} /> Actualiser maintenant</button></div>
            ) : (
              <div className="lead-list">{leads.map(lead => <article className="lead-card" key={lead.id}>
                <div className="lead-card-top"><span className="category-tag"><span className="tag-dot" />{lead.category}</span><span className="lead-time"><Clock3 size={13} />{formatDate(lead.createdAt)}</span></div>
                <div className="lead-card-main"><div className="lead-location"><MapPin size={14} />{lead.city}</div><p className="lead-description">{lead.description}</p></div>
                <div className="lead-card-bottom">
                  {lead.contact ? <div className="contact-details"><span className="contact-unlocked"><CheckCircle2 size={14} /> Coordonnées débloquées</span><strong>{lead.contact.name}</strong><a href={`tel:${lead.contact.phone}`}>{lead.contact.phone}</a><a href={`mailto:${lead.contact.email}`}>{lead.contact.email}</a></div> : <div className="contact-locked"><span className="lock-icon"><LockKeyhole size={16} /></span><span><strong>Coordonnées protégées</strong><small>Débloquez l’accès pour prendre contact.</small></span><button className="unlock-button" onClick={() => setPlanDialog(true)}>Débloquer les coordonnées <ArrowRight size={15} /></button></div>}
                </div>
              </article>)}</div>
            )}
          </section>

          <section className="pricing-section" id="tarifs">
            <div className="pricing-copy"><span className="section-kicker">UN ACCÈS EN TOUTE CLARTÉ</span><h2>Les bonnes rencontres commencent par le bon échange.</h2><p>Un seul abonnement pour accéder aux coordonnées des demandes correspondant à votre profil.</p><div className="pricing-note"><ShieldCheck size={15} /> Aucun paiement réel dans cette démonstration.</div></div>
            <div className="pricing-card"><span className="pricing-label">ABONNEMENT AVOCAT</span><div className="price"><strong>300</strong><span><b>DH</b><small>/ mois</small></span></div><ul><li><Check size={15} /> Accès aux coordonnées des leads</li><li><Check size={15} /> Dossiers filtrés par ville et spécialité</li><li><Check size={15} /> Nouveaux leads dans votre fil</li></ul>{profile.subscriptionActive ? <div className="active-plan"><CheckCircle2 size={16} /> Accès démo activé</div> : <button className="pricing-button" onClick={() => setPlanDialog(true)}>Débloquer les coordonnées <ArrowRight size={16} /></button>}<small className="pricing-legal">Abonnement présenté à titre indicatif · paiement simulé</small></div>
          </section>
        </>}
      </main>
      <footer className="site-footer dashboard-footer"><a className="brand-home footer-brand" href="/"><BrandMark /></a><span>MohamiConnect · La proximité au service du droit.</span><a href="/">Retour à l’accueil <ArrowRight size={14} /></a></footer>

      {planDialog && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setPlanDialog(false); }}><section className="plan-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => setPlanDialog(false)} aria-label="Fermer">×</button><span className="modal-icon"><Sparkles size={22} /></span><span className="section-kicker">ACCÈS AUX COORDONNÉES</span><h2 id="modal-title">Un abonnement, des échanges directs.</h2><p>L’abonnement est affiché à 300 DH / mois. Dans cette démonstration, l’activation ouvre les coordonnées sans déclencher de paiement réel.</p><div className="modal-price"><strong>300 DH</strong><span>/ mois</span></div><button className="submit-button" onClick={activate} disabled={activateDemo.isPending}>{activateDemo.isPending ? "Activation…" : <>Activer l’accès démo <ArrowRight size={16} /></>}</button><button className="modal-cancel" onClick={() => setPlanDialog(false)}>Pas maintenant</button></section></div>}
    </div>
  );
}
