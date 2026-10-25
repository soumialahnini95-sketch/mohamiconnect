import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Check, Clock3, Mail, MapPin, ShieldAlert } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function BrandMark() {
  return <span className="brand-lockup"><span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none"><path d="M7 36V21.2C7 12.82 13.72 6 22 6s15 6.82 15 15.2V36" stroke="currentColor" strokeWidth="2.2"/><path d="M13 36V22a9 9 0 0 1 18 0v14M4 36h36M22 13v16m-7-8h14m-10.5 0-4 6h8l-4-6Zm7 0-4 6h8l-4-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span className="brand-name">Mohami<span>Connect</span></span></span>;
}

export default function AdminLawyers() {
  const auth = useAuth();
  const queue = trpc.admin.verificationQueue.useQuery(undefined, { enabled: auth.user?.role === "admin" });
  const utils = trpc.useUtils();
  const verify = trpc.admin.verifyLawyer.useMutation({
    onSuccess: async () => {
      await utils.admin.verificationQueue.invalidate();
      toast.success("Profil avocat validé. Il peut maintenant consulter les demandes correspondantes.");
    },
    onError: error => toast.error(error.message),
  });

  if (auth.loading) return <div className="loading-page"><span className="button-spinner"/><span>Chargement…</span></div>;
  if (!auth.isAuthenticated) return (
    <main className="lawyer-login-page"><header className="site-header dashboard-header"><a className="brand-home" href="/"><BrandMark /></a></header><section className="login-panel"><span className="login-icon"><ShieldAlert size={23}/></span><h1>Accès administrateur</h1><p>Connectez-vous avec le compte administrateur autorisé pour examiner les profils avocat.</p><button className="submit-button" onClick={() => startLogin()}>Se connecter avec Manus</button></section></main>
  );
  if (auth.user?.role !== "admin") return (
    <main className="lawyer-login-page"><header className="site-header dashboard-header"><a className="brand-home" href="/"><BrandMark /></a></header><section className="login-panel"><span className="login-icon"><ShieldAlert size={23}/></span><h1>Cette page est réservée.</h1><p>Seul un administrateur MohamiConnect peut valider les profils avocat.</p><a className="submit-button admin-back-button" href="/avocat"><ArrowLeft size={16}/> Retour à mon espace</a></section></main>
  );

  return (
    <div className="dashboard-page">
      <header className="site-header dashboard-header"><a className="brand-home" href="/"><BrandMark /></a><a className="text-link" href="/avocat"><ArrowLeft size={14}/> Espace avocat</a></header>
      <main className="dashboard-main admin-main">
        <div className="dashboard-eyebrow"><span className="section-kicker">ADMINISTRATION</span><span className="breadcrumb">MohamiConnect <span>/</span> Vérification</span></div>
        <div className="dashboard-heading"><div><h1>Profils à examiner.</h1><p>Validez les avocats avant de leur donner accès aux demandes clients.</p></div><span className="admin-count"><Clock3 size={14}/>{queue.data?.length ?? 0} en attente</span></div>
        <div className="admin-trust-note"><ShieldAlert size={17}/><span>Avant d’approuver, vérifiez l’identité et le statut professionnel de l’avocat par votre procédure habituelle. MohamiConnect ne valide pas les documents automatiquement.</span></div>
        {queue.error && <div className="inline-error" role="alert">Impossible de charger la file d’attente. <button onClick={() => queue.refetch()}>Réessayer</button></div>}
        {queue.isLoading ? <div className="empty-state"><span className="button-spinner"/><p>Chargement des profils…</p></div> : queue.data?.length ? <div className="verification-list">{queue.data.map(profile => (
          <article className="verification-card" key={profile.profileId}>
            <div className="verification-card-main"><span className="lawyer-avatar verification-avatar"><BriefcaseBusiness size={16}/></span><div className="verification-details"><h2>{profile.lawyerName || "Nom non renseigné"}</h2><span className="verification-email"><Mail size={13}/>{profile.email || "E-mail non renseigné"}</span><div className="verification-target"><span><MapPin size={13}/>{profile.city}</span><span><BadgeCheck size={13}/>{profile.specialty}</span></div><small>Inscription le {new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium" }).format(new Date(profile.createdAt))}</small></div></div>
            <button className="verify-button" disabled={verify.isPending} onClick={() => verify.mutate({ profileId: profile.profileId, verified: true })}><Check size={15}/>{verify.isPending ? "Validation…" : "Valider le profil avocat"}</button>
          </article>
        ))}</div> : <div className="empty-state"><span className="empty-icon"><BadgeCheck size={22}/></span><h3>Aucun profil en attente.</h3><p>Les nouveaux profils avocat apparaîtront ici après leur inscription.</p></div>}
      </main>
    </div>
  );
}
