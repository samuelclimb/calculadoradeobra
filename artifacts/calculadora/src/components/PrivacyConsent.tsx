import { Link } from "wouter";

type PrivacyConsentProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function PrivacyConsent({ id, checked, onCheckedChange }: PrivacyConsentProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
        required
      />
      <span>
        Li e aceito a{" "}
        <Link href="/privacidade" className="font-medium text-primary underline underline-offset-4">
          Política de Privacidade
        </Link>
        . Autorizo o tratamento dos meus dados para gerar e armazenar este diagnóstico, conforme a LGPD.
      </span>
    </label>
  );
}
