"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!APP_ID) return; // credencial não configurada ainda

    OneSignal.init({
      appId: APP_ID,
      safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notifyButton: { enable: false } as any, // usamos nossa própria UI
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerParam: { scope: "/" },
    }).catch(() => {
      // OneSignal falha silenciosamente fora de HTTPS / sem credenciais
    });
  }, []);

  return <>{children}</>;
}

/**
 * Solicita permissão de push via OneSignal.
 * Retorna true se a permissão foi concedida.
 */
export async function requestPushPermission(externalId?: string): Promise<boolean> {
  if (!APP_ID) return false;
  try {
    await OneSignal.Notifications.requestPermission();
    if (externalId) await OneSignal.login(externalId);
    return OneSignal.Notifications.permission;
  } catch {
    return false;
  }
}

/** Verifica se o usuário já deu permissão de push. */
export function hasPushPermission(): boolean {
  if (typeof window === "undefined" || !APP_ID) return false;
  return OneSignal.Notifications.permission;
}
