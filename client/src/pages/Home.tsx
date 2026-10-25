import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowRight, Check, CheckCircle2, ChevronDown, Clock3, LockKeyhole, MapPin, Scale, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CITIES, LEGAL_CATEGORIES, type City, type LegalCategory } from "@shared/legal";

const emptyForm = {
  category: "" as LegalCategory | "",
  city: "" as City | "",
  description: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand-lockup${light ? " brand-lockup-light" : ""}`}>
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none">
          <path d="M7 36V21.2C7 12.82 13.72 6 22 6s15 6.82 15 15.2V36" stroke="currentColor" strokeWidth="2.2" />
          <path d="M13 36V22a9 9 0 0 1 18 0v14M4 36h36M22 13v16m-7-8h14m-10.5 0-4 6h8l-4-6Zm7 0-4 6h8l-4-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="brand-name">Mohami<span>Connect</span></span>
    </span>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand-home" href="/" aria-label="MohamiConnect, accueil"><BrandMark /></a>
      <nav className="main-nav" aria-label="Navigation principale">
        <a href="#expertises">Nos expertises</a>
        <a href="#comment-ca-marche">Comment ça marche</a>
      </nav>
      <a className="lawyer-link" href="/avocat">Espace avocat <ArrowRight size={15} /></a>
    </header>
  );
}

export default function Home() {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const submitLead = trpc.lead.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setForm(emptyForm);
    },
    onError: error => toast.error(error.message || "Votre demande n’a pas pu être envoyée."),
  });

  const update = (field: keyof typeof emptyForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.category || !form.city) return;
    submitLead.mutate({
      category: form.category,
      city: form.city,
      description: form.description,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
    });
  };

  return (
    <div className="public-page">
      <Header />
      <main>
        <section className="hero-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> Le droit, plus proche de vous</div>
            <h1 id="hero-title">Trouvez l'avocat qu'il vous faut <em>au Maroc</em></h1>
            <p className="hero-intro">Décrivez votre situation. Votre demande est transmise aux avocats dont la ville et la spécialité correspondent à votre besoin.</p>
            <a className="hero-scroll" href="#demande"><span className="scroll-icon"><ArrowDown size={15} /></span> Déposer une demande <span className="scroll-rule" /></a>
            <div className="hero-assurances">
              <div className="assurance-item"><span className="assurance-icon"><ShieldCheck size={17} /></span><span><strong>Vos échanges restent privés</strong><small>Coordonnées protégées</small></span></div>
              <div className="assurance-divider" />
              <div className="assurance-item"><span className="assurance-icon"><MapPin size={17} /></span><span><strong>Partout au Maroc</strong><small>Quatre villes couvertes</small></span></div>
            </div>
            <div className="hero-seal" aria-hidden="true">
              <div className="seal-ring"><Scale size={25} strokeWidth={1.5} /><span>JUSTICE<br />DE PROXIMITÉ</span></div>
            </div>
          </div>

          <div className="form-side" id="demande">
            <div className="request-card">
              <div className="form-heading">
                <div>
                  <span className="form-kicker">PREMIÈRE ÉTAPE</span>
                  <h2>Parlez-nous de votre besoin</h2>
                </div>
                <span className="form-step">01 <span>/ 01</span></span>
              </div>
              {submitted && (
                <div className="success-message" role="status">
                  <CheckCircle2 size={21} />
                  <div><strong>Votre demande est bien envoyée.</strong><span>Elle est transmise aux avocats qui correspondent à votre ville et à votre besoin.</span></div>
                </div>
              )}
              <form className="lead-form" onSubmit={handleSubmit}>
                <div className="field-row">
                  <label className="field-group">
                    <span>Catégorie juridique <b>*</b></span>
                    <span className="select-wrap"><select required value={form.category} onChange={event => update("category", event.target.value)}>
                      <option value="" disabled>Choisir une spécialité</option>
                      {LEGAL_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                    </select><ChevronDown size={16} /></span>
                  </label>
                  <label className="field-group">
                    <span>Ville <b>*</b></span>
                    <span className="select-wrap"><select required value={form.city} onChange={event => update("city", event.target.value)}>
                      <option value="" disabled>Choisir une ville</option>
                      {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select><ChevronDown size={16} /></span>
                  </label>
                </div>
                <label className="field-group">
                  <span>Description de votre dossier <b>*</b></span>
                  <textarea required minLength={20} maxLength={5000} rows={4} placeholder="Expliquez-nous brièvement votre situation et le conseil recherché…" value={form.description} onChange={event => update("description", event.target.value)} />
                  <small className="field-hint">Vos détails sont partagés uniquement avec des avocats ciblés.</small>
                </label>
                <div className="form-divider"><span>VOS COORDONNÉES</span></div>
                <label className="field-group">
                  <span>Nom complet <b>*</b></span>
                  <input required autoComplete="name" maxLength={120} placeholder="Votre nom" value={form.contactName} onChange={event => update("contactName", event.target.value)} />
                </label>
                <div className="field-row contact-row">
                  <label className="field-group">
                    <span>Téléphone <b>*</b></span>
                    <input required type="tel" autoComplete="tel" minLength={7} maxLength={40} placeholder="+212 6…" value={form.contactPhone} onChange={event => update("contactPhone", event.target.value)} />
                  </label>
                  <label className="field-group">
                    <span>E-mail <b>*</b></span>
                    <input required type="email" autoComplete="email" maxLength={320} placeholder="vous@exemple.ma" value={form.contactEmail} onChange={event => update("contactEmail", event.target.value)} />
                  </label>
                </div>
                <label className="consent-row">
                  <input required type="checkbox" />
                  <span>J’accepte que mes informations soient transmises aux avocats correspondant à ma demande.</span>
                </label>
                <button className="submit-button" type="submit" disabled={submitLead.isPending}>
                  {submitLead.isPending ? <><span className="button-spinner" /> Envoi en cours…</> : <>Envoyer ma demande à un avocat <ArrowRight size={17} /></>}
                </button>
                <div className="form-secure"><LockKeyhole size={13} /> Informations protégées et transmises de façon sécurisée</div>
              </form>
            </div>
            <div className="form-note"><Clock3 size={14} /> Une demande claire est le premier pas vers un conseil adapté.</div>
          </div>
        </section>

        <section className="expertise-section" id="expertises">
          <div className="section-heading">
            <div><span className="section-kicker">UN ACCOMPAGNEMENT CIBLÉ</span><h2>Le bon regard, au bon endroit.</h2></div>
            <p>Choisissez le domaine juridique qui correspond à votre situation. Votre demande rejoint les avocats de la ville sélectionnée.</p>
          </div>
          <div className="expertise-list">
            {LEGAL_CATEGORIES.map((category, index) => (
              <a className="expertise-item" href="#demande" key={category} onClick={() => setForm(current => ({ ...current, category }))}>
                <span className="expertise-number">0{index + 1}</span><span className="expertise-name">{category}</span><ArrowRight size={17} className="expertise-arrow" />
              </a>
            ))}
          </div>
        </section>

        <section className="how-section" id="comment-ca-marche">
          <div className="how-heading"><span className="section-kicker">SIMPLE, ET HUMAIN</span><h2>Votre démarche en trois temps.</h2></div>
          <div className="how-steps">
            <article><span className="step-count">01</span><div><h3>Décrivez votre besoin</h3><p>Partagez les éléments essentiels de votre situation et indiquez votre ville.</p></div></article>
            <article><span className="step-count">02</span><div><h3>Votre demande est orientée</h3><p>Elle est présentée aux avocats dont le domaine et la ville correspondent.</p></div></article>
            <article><span className="step-count">03</span><div><h3>Échangez en confiance</h3><p>Vos coordonnées restent protégées jusqu'à leur déblocage par un avocat.</p></div></article>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a className="brand-home footer-brand" href="/"><BrandMark light /></a>
        <span>Une passerelle vers un accompagnement juridique au Maroc.</span>
        <a href="/avocat">Vous êtes avocat ? <ArrowRight size={14} /></a>
      </footer>
    </div>
  );
}
