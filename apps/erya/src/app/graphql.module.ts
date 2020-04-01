import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { DefaultOptions } from 'apollo-client';
import { environment } from '../environments/environment';

// https://www.apollographql.com/docs/react/api/react-apollo/#optionsfetchpolicy
// https://www.apollographql.com/docs/react/api/react-apollo/#optionserrorpolicy
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache', // for dev
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache', // for dev
    errorPolicy: 'all'
  }
};

export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({ uri: `${environment.apiUri}/graphql` });

  const error = onError((e: any) => {
    if (e.networkError && e.networkError.error) {
      //   throw new Error(
      //     'networkError' + e.networkError.error.errors.join('\n').toString()
      //   );
      throw e;
    } else {
      throw e;
    }
  });

  const link = error.concat(http);

  return {
    link: link,
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule {}
