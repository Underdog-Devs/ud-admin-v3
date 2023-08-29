import {Login as LoginComponent} from '@/components/auth/Login';

export default function Index() {


  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <LoginComponent />
    </div>
  )
}
