import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@edfu/api-interfaces';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'edfu-basic',
  templateUrl: './basic.component.html'
})
export class BasicComponent implements OnInit {
  hello$ = this.http.get<Message>('/api/hello');
  message: any;
  loading = true;
  error: any;

  constructor(private http: HttpClient, private apollo: Apollo) {}

  ngOnInit() {
    this.apollo
      .watchQuery({
        query: gql`
          {
            headwordsAll {
              _id
              oxId
              homographC
              word
              topLevel
            }
          }
        `
      })
      .valueChanges.subscribe(result => {
        this.message = result.data;
        this.loading = result.loading;
        this.error = result.errors;
      });
  }
}
