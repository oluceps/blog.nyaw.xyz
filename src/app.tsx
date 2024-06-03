import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import { MDXProvider } from "solid-mdx";
import Mdx from "./components/Mdx"
import "./style.css";
import { Layout } from "./components/Layout";
import PageNotFound from "./components/PageNotFound";
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

export default function App() {
  return (
    <Router
      root={props => (
        <main>
          <ErrorBoundary fallback={<PageNotFound />}>
            <Layout>
              <MDXProvider components={Mdx}>
                <Suspense>{props.children}</Suspense>
              </MDXProvider>
            </Layout>
          </ErrorBoundary>
        </main>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
