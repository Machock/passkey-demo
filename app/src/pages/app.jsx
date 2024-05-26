// import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

// import { getUsers } from 'src/services';

import { AppView } from 'src/sections/overview/view';


// ----------------------------------------------------------------------

export default function AppPage() {
  

  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <AppView />
    </>
  );
}
