import { Skeleton } from "@/components/feedback/Skeleton";

import { LOGIN_LAYOUT } from "../../constants/login-layout";

export const LoginPageSkeleton = () => (
  <>
    <section className={`${LOGIN_LAYOUT.heroPanel} space-y-6`} aria-hidden>
      <Skeleton className="h-10 w-44" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-20 w-full max-w-xl" />
      </div>
      <div className={LOGIN_LAYOUT.productGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </section>
    <section className={LOGIN_LAYOUT.authPanel} aria-hidden>
      <Skeleton className="h-[420px] w-full rounded-2xl" />
    </section>
  </>
);
