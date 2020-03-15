import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import gql from 'graphql-tag';
import { HydratedSense, CreateSignInputInterface } from '@edfu/api-interfaces';
import { map } from 'rxjs/operators';
import { ApolloQueryResult } from 'apollo-client';
import { SenseArrangerService } from '../search/sense-grouping/sense-arranger.service';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl
} from '@angular/forms';

interface SensesFromApiSearchVariables {
  searchString?: string;
}

interface SensesFromApiResult {
  sensesFromApi: HydratedSense[];
}

const SensesFromApiQuery = gql`
  query SensesFromApiQuery($searchString: String! = "") {
    sensesFromApi(searchString: $searchString) {
      oxId
      homographC
      ownEntryOxId
      senseId
      lexicalCategory
      apiSenseIndex
      example
      definition
      associationType
    }
  }
`;

const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

function checkedValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const checkedCount = control.value.filter((value: any) => !!value).length;
    return checkedCount ? null : { checkedCount: { value: checkedCount } };
  };
}

@Component({
  selector: 'edfu-contibute',
  templateUrl: './contribute.component.html'
})
export class ContributeComponent implements OnInit, OnDestroy {
  sensesFromApiSearchRef: QueryRef<
    SensesFromApiResult,
    SensesFromApiSearchVariables
  >;

  senses$: Observable<HydratedSense[]>;
  senses: HydratedSense[];

  public signFormGroup: FormGroup;
  private checkboxControl: FormArray;

  subscription: Subscription;

  constructor(
    private apollo: Apollo,
    private senseArranger: SenseArrangerService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.signFormGroup = this.fb.group({
      senseIds: this.fb.array([], checkedValidator()),
      mediaUrl: ['', [Validators.required, Validators.pattern(URL_REGEX)]],
      mnemonic: ['', Validators.maxLength(200)]
    });

    this.checkboxControl = this.signFormGroup.controls.senseIds as FormArray;

    this.sensesFromApiSearchRef = this.apollo.watchQuery<
      SensesFromApiResult,
      SensesFromApiSearchVariables
    >({
      query: SensesFromApiQuery
    });

    this.senses$ = this.sensesFromApiSearchRef.valueChanges.pipe(
      map(
        (res: ApolloQueryResult<SensesFromApiResult>) => res.data.sensesFromApi
      ),
      map(senses => this.senseArranger.sortAndFilter(senses, false))
    );

    this.senses$.subscribe(senses => {
      this.checkboxControl.clear();
      for (const _ of senses) {
        this.checkboxControl.push(new FormControl(false));
      }
      this.senses = senses;
    });

    this.subscription = this.checkboxControl.valueChanges.subscribe(
      checkbox => {
        this.checkboxControl.setValue(
          this.checkboxControl.value.map((value, i) =>
            value ? this.senses[i].senseId : false
          ),
          { emitEvent: false }
        );
      }
    );
  }

  onSearchButtonPress(searchString: string) {
    this.sensesFromApiSearchRef.setVariables({ searchString: searchString });
  }

  onSubmit() {
    const formValue = {
      ...this.signFormGroup.value,
      senseIds: this.checkboxControl.value.filter(value => !!value)
    };
    if (this.checkboxControl.valid) {
      this.callCreateSignMutation(formValue);
    } else {
      console.log('formValue not valid');
    }
  }

  callCreateSignMutation(createSignData: CreateSignInputInterface) {
    const createSignWithAssociationsMutation = gql`
      mutation createSignWithAssociationsMutation(
        $createSignData: CreateSignInput!
      ) {
        createSignWithAssociations(createSignData: $createSignData) {
          mnemonic
          mediaUrl
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: createSignWithAssociationsMutation,
        variables: { createSignData: createSignData }
      })
      .subscribe(
        ({ data }) => {
          console.log('response:');
          console.log(data);
        },
        error => {
          console.error(error);
        }
      );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
