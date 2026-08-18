import {
  useLogout,
  useResendVerificationEmail,
  useUser,
  useVerifyEmail,
} from '@/framework/user';
import Button from '@/components/ui/button';
import Card from '@/components/ui/cards/card';
import Input from '@/components/ui/forms/input';
import { useTranslation } from 'next-i18next';
import Logo from '@/components/ui/logo';
import { useToken } from '@/lib/hooks/use-token';
import { useRouter } from 'next/router';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { useState } from 'react';

export { getStaticProps } from '@/framework/general.ssr';

const VerifyEmail = () => {
  const { getEmailVerified } = useToken();
  const router = useRouter();
  const { emailVerified } = getEmailVerified();
  const { mutate: logout, isLoading: isLogoutLoader } = useLogout();
  useUser();

  if (emailVerified) {
    router.push('/profile');
  }
  const handleLogout = () => {
    logout();
    router.push(Routes.home);
  };

  const { t } = useTranslation('common');
  const { mutate: resendEmail, isLoading: isResending } =
    useResendVerificationEmail();
  const { mutate: verifyEmail, isLoading: isVerifying } = useVerifyEmail();
  const [verificationCode, setVerificationCode] = useState('');

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[#F4F6F7] py-5 px-4 md:py-8">
      <div className="max-w-[36rem]">
        <Card className="text-center !shadow-900 md:px-[4.375rem] md:py-[2.875rem]">
          <Logo />

          <h2 className="mb-5 mt-2 text-2xl font-semibold">
            {t('common:email-not-verified')}
          </h2>

          <p className="mb-8 text-lg text-[#969FAF]">
            {t('email-not-description')}
          </p>

          <div className="mb-4">
            <Input
              name="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder={t('verification-code-placeholder')}
              value={verificationCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setVerificationCode(e.target.value.replace(/\D/g, ''))
              }
              className="w-full text-center !text-xl tracking-[0.5em]"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => verifyEmail({ code: verificationCode })}
              disabled={isVerifying || isResending || verificationCode.length !== 6}
              loading={isVerifying}
              className="!h-13 w-full hover:bg-accent-hover"
            >
              {t('verify-email-button-text')}
            </Button>
            <Button
              onClick={() => resendEmail()}
              disabled={isResending || isVerifying}
              loading={isResending}
              variant="outline"
              className="!h-13 w-full"
            >
              {t('resend-verification-button-text')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="!h-13 w-full"
              onClick={() => handleLogout()}
              disabled={!!isVerifying || isResending || isLogoutLoader}
              loading={isLogoutLoader}
            >
              {t('auth-menu-logout')}
            </Button>
          </div>
          <div className="mt-4">
            <Link
              href={Routes.home}
              className="inline-flex items-center text-bolder underline hover:text-body-dark hover:no-underline focus:outline-none sm:text-base"
            >
              {t('404-back-home')}
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};
VerifyEmail.authenticationRequired = true;
export default VerifyEmail;
