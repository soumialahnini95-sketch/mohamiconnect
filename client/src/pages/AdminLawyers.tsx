import { useState } from "react";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Check, Clock3, CreditCard, Mail, MapPin, ShieldAlert, ShieldCheck } from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function BrandMark() {
  return <span className="brand-lockup"><span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none"><path d="M7 36V21.2C7 12.82 13.72 6 22 6s15 6.82 15 15.2V36" stroke="currentColor" strokeWidth="2.2"/><path d="M13 36V22a9 9 0 0 1 18 0v14M4 36h36M22 13v16m-7-8h14m-10.5 0-4 6h8l-4-6Zm7 0-4 6h8l-4-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span className="brand-name">Mohami<span>Connect</span></span></span>;
}

export default function AdminLawyers() {
  const auth = useAuth();
  const profiles = trpc.admin.profiles.useQuery(undefined, { enabled: auth.user?.role === "admin" });
  const utils = trpc.useUtils();
  const [pendingProfileId, setPendingProfileId] = useState<number | null>(null);
  const verify = trpc.admin.verifyLawyer.useMutation({
    onSuccess: async () => {
      await utils.admin.profiles.invalidate();
      toast.success("Profil avocat validé. Il peut maintenant consulter les demandes correspondantes.");
    },
    onError: error => toast.error(error.message),
    onSettled: () => setPendingProfileId(null),
  });
  const subscription = trpc.admin.setSubscriptionDemoState.useMutation({
    onSuccess: async (_result, input) => {
      await utils.admin.profiles.invalidate();
      toast.success(input.active ? "Paiement simulé : accès démo activé, aucun prélèvement effectué." : "État de paiement démo réinitialisé.");
    },
    onError: error => toast.error(error.message),
    onSettled: () => setPendingProfileId(null),
  });
  const pendingCount = profiles.data?.filter(profile => !profile.verified).length ?? 0;

  if (auth.loading) return <div className="loading-page"><span className="button-spinner"/><span>Chargement…</span></div>;
  if (!auth.isAuthenticated) return (
    <main className="lawyer-login-page"><header className="site-header dashboard-header"><a className="brand-home" href="/"><BrandMark /></a></header><section className="login-panel"><span className="login-icon"><ShieldAlert size={23}/></span><h1>Accès administrateur</h1><p>Connectez-vous avec le compte administrateur autorisé pour examiner les profils et les abonnements de démonstration.</p><button className="submit-button" onClick={() => startLogin()}>Se connecter</button></section></main>
  );
  if (auth.user?.role !== "admin") return (
    <main className="lawyer-login-page"><header className="site-header dashboard-header"><a className="brand-home" href="/"><BrandMark /></a></header><section className="login-panel"><span className="login-icon"><ShieldAlert size={23}/></span><h1>Cette page est réservée.</h1><p>Seul un administrateur MohamiConnect peut valider les profils et simuler l’état d’abonnement.</p><a className="submit-button admin-back-button" href="/avocat"><ArrowLeft size={16}/> Retour à mon espace</a></section></main>
  );

  return (
    <div className="dashboard-page">
      <header className="site-header dashboard-header"><a className="brand-home" href="/"><BrandMark /></a><a className="text-link" href="/avocat"><ArrowLeft size={14}/> Espace avocat</a></header>
      <main className="dashboard-main admin-main">
        <div className="dashboard-eyebrow"><span className="section-kicker">ADMINISTRATION</span><span className="breadcrumb">MohamiConnect <span>/</span> Gestion des avocats</span></div>
        <div className="dashboard-heading"><div><h1>Profils & abonnements.</h1><p>Validez les avocats et gérez l’accès démo à leurs demandes.</p></div><span className="admin-count"><Clock3 size={14}/>{pendingCount} à valider</span></div>
        <div className="admin-trust-note"><ShieldAlert size={17}/><span>Vérifiez l’identité et le statut professionnel de chaque avocat par votre procédure habituelle. « Simuler le paiement » modifie uniquement l’accès démo à 300 DH / mois : aucun paiement ni prélèvement réel n’est effectué.</span></div>
        {profiles.error && <div className="inline-error" role="alert">Impossible de charger les profils. <button onClick={() => profiles.refetch()}>Réessayer</button></div>}
        {profiles.isLoading ? <div className="empty-state"><span className="button-spinner"/><p>Chargement des profils…</p></div> : profiles.data?.length ? <div className="verification-list">{profiles.data.map(profile => (
          <article className="verification-card admin-lawyer-card" key={profile.profileId}>
            <div className="verification-card-main"><span className="lawyer-avatar verification-avatar"><BriefcaseBusiness size={16}/></span><div className="verification-details"><h2>{profile.lawyerName || "Nom non renseigné"}</h2><span className="verification-email"><Mail size={13}/>{profile.email || "E-mail non renseigné"}</span><div className="verification-target"><span><MapPin size={13}/>{profile.city}</span><span><BadgeCheck size={13}/>{profile.specialty}</span></div><small>Inscription le {new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium" }).format(new Date(profile.createdAt))}</small><div className="admin-status-row"><span className={profile.verified ? "admin-status status-verified" : "admin-status status-pending"}>{profile.verified ? <><ShieldCheck size={13}/> Profil validé</> : <><Clock3 size={13}/> En attente de validation</>}</span><span className={profile.subscriptionActive ? "admin-status status-paid" : "admin-status status-unpaid"}>{profile.subscriptionActive ? <><Check size={13}/> Abonnement démo actif</> : <><CreditCard size={13}/> Abonnement inactif</>}</span></div></div></div>
            <div className="admin-lawyer-actions">
              {!profile.verified ? <button className="verify-button" disabled={verify.isPending || subscription.isPending} onClick={() => { setPendingProfileId(profile.profileId); verify.mutate({ profileId: profile.profileId, verified: true }); }}><Check size={15}/>{pendingProfileId === profile.profileId && verify.isPending ? "Validation…" : "Valider le profil avocat"}</button> : profile.subscriptionActive ? <button className="reset-payment-button" disabled={verify.isPending || subscription.isPending} onClick={() => { setPendingProfileId(profile.profileId); subscription.mutate({ profileId: profile.profileId, active: false }); }}>{pendingProfileId === profile.profileId && subscription.isPending ? "Mise à jour…" : "Réinitialiser la simulation"}</button> : <button className="verify-button simulate-payment-button" disabled={verify.isPending || subscription.isPending} onClick={() => { setPendingProfileId(profile.profileId); subscription.mutate({ profileId: profile.profileId, active: true }); }}><CreditCard size={15}/>{pendingProfileId === profile.profileId && subscription.isPending ? "Simulation…" : "Simuler le paiement · 300 DH/mois"}</button>}
            </div>
          </article>
        ))}</div> : <div className="empty-state"><span className="empty-icon"><BadgeCheck size={22}/></span><h3>Aucun profil avocat inscrit.</h3><p>Les nouveaux profils apparaîtront ici avec leur statut de validation et d’abonnement.</p></div>}
      </main>
    </div>
  );
}
