import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '../environments/environment';
import { DefaultOptions } from 'apollo-client';

// https://www.apollographql.com/docs/react/api/react-apollo/#optionsfetchpolicy
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-first'
  },
  query: {
    fetchPolicy: 'cache-first'
  }
};

export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({
    uri: `${environment.apiUri}/graphql`
  });

  return {
    link: http,
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
