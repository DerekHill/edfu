import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';

const uri = 'http://localhost:3333/graphql';

export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({ uri });

  const error = onError(e => {
    console.error('apollo-link-error found error:');
    console.error(e);
  });

  const link = error.concat(http);

  return {
    link: link,
    cache: new InMemoryCache()
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
