"use client";
import { useEffect, useRef, useState } from "react";
import { useResendVerification, useVerifyEmail } from "../../hooks/auth";
import { getAuthErrorMessage } from "../actions";
import { normalizeAuthEmail } from "../normalize-email";
import {
  authErrorAlertClass,
  authInputClass,
  authLabelClass,
  authOutlineButtonClass,
  authSubmitButtonClass,
  authSuccessAlertClass,
} from "./styles";

interface VerifyEmailFormProps {
  email: string;
  initialCode?: string;
  onVerified?: () => void;
  onAutoVerifyFailed?: (error: { code?: string; message?: string }) => Promise<boolean>;
  recoveryMessage?: string | null;
}

export function VerifyEmailForm({
  email,
  initialCode = "",
  onVerified,
  onAutoVerifyFailed,
  recoveryMessage,
}: VerifyEmailFormProps) {
  const normalizedEmail = normalizeAuthEmail(email);
  const [code, setCode] = useState(initialCode);
  const [autoVerifyFailed, setAutoVerifyFailed] = useState(false);
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const autoVerifyStarted = useRef(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  async function verifyWithCode(otp: string) {
    await verifyMutation.mutateAsync({
      email: normalizedEmail,
      code: otp,
    });
    onVerified?.();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await verifyWithCode(code);
    } catch {}
  }

  useEffect(() => {
    if (!normalizedEmail || initialCode.length !== 6 || autoVerifyStarted.current) return;
    autoVerifyStarted.current = true;

    void (async () => {
      try {
        await verifyWithCode(initialCode);
      } catch (error) {
        setAutoVerifyFailed(true);
        setCode("");
        if (onAutoVerifyFailed) {
          await onAutoVerifyFailed(error as { code?: string; message?: string });
        }
      }
    })();
  }, [normalizedEmail, initialCode]);

  const isAutoVerifying = Boolean(
    initialCode.length === 6 && verifyMutation.isPending && !autoVerifyFailed
  );

  const showForm = !isAutoVerifying || autoVerifyFailed;

  return (
    <div className="flex flex-col gap-4">
      {isAutoVerifying ? <div className={authSuccessAlertClass}>Verifying your email…</div> : null}

      {recoveryMessage ? <div className={authSuccessAlertClass}>{recoveryMessage}</div> : null}

      {autoVerifyFailed && initialCode ? (
        <div className={authErrorAlertClass}>
          {getAuthErrorMessage(
            (verifyMutation.error as { message?: string; code?: string }) ?? {
              code: "INVALID_OTP",
            }
          )}
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className={authLabelClass}>
              Verification code
            </label>
            <input
              id="code"
              className={authInputClass}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
            />
          </div>
          <button
            type="submit"
            className={authSubmitButtonClass}
            disabled={verifyMutation.isPending || code.length < 6}
          >
            {verifyMutation.isPending ? "Verifying…" : "Verify email"}
          </button>
        </form>
      ) : null}

      {showForm ? (
        <button
          type="button"
          className={authOutlineButtonClass}
          disabled={resendMutation.isPending || resendCooldown > 0}
          onClick={() => {
            resendMutation.mutate({ email: normalizedEmail });
            setResendCooldown(30);
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
            cooldownTimer.current = setInterval(() => {
              setResendCooldown((prev) => {
                if (prev <= 1) {
                  if (cooldownTimer.current) clearInterval(cooldownTimer.current);
                  cooldownTimer.current = null;
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }}
        >
          {resendMutation.isPending
            ? "Sending..."
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend verification code"}
        </button>
      ) : null}

      {(verifyMutation.error || resendMutation.error) && !autoVerifyFailed ? (
        <div className={authErrorAlertClass}>
          {getAuthErrorMessage(
            (verifyMutation.error ?? resendMutation.error) as { message?: string; code?: string }
          )}
        </div>
      ) : null}

      {resendMutation.isSuccess && (
        <div className={authSuccessAlertClass}>
          A new verification code was sent to {normalizedEmail}. Check your inbox and spam folder.
        </div>
      )}
    </div>
  );
}
