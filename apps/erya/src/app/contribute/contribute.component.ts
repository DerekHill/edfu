import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import gql from 'graphql-tag';
import {
  HydratedSense,
  CreateSignInputInterface,
  IResponse
} from '@edfu/api-interfaces';
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
import { UploadService } from './upload/upload.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faExclamationCircle, faExternalLinkAlt, faUpload } from '@fortawesome/free-solid-svg-icons';

interface SensesFromApiSearchVariables {
  searchString?: string;
}

interface SensesFromApiResult {
  sensesFromApi: HydratedSense[];
}

enum UploadStatus {
  none = 'none',
  uploading = 'uploading',
  creating = 'creating',
  success = 'success',
  error = 'error'
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

function checkedValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const checkedCount = control.value.filter((value: any) => !!value).length;
    return checkedCount ? null : { checkedCount: { value: checkedCount } };
  };
}

@Component({
  selector: 'edfu-contribute',
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
  public fileToUpload: File = null;
  public uploadStatus = UploadStatus.none;

  private checkboxControl: FormArray;

  subscription: Subscription;

  constructor(
    private apollo: Apollo,
    private senseArranger: SenseArrangerService,
    private uploadService: UploadService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public library: FaIconLibrary
  ) {
    library.addIcons(faExternalLinkAlt, faUpload, faCheckCircle, faExclamationCircle);
  }

  ngOnInit() {
    this.signFormGroup = this.fb.group({
      senseIds: this.fb.array([], checkedValidator()),
      mnemonic: ['', Validators.maxLength(200)],
      file: [null, Validators.required]
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
        const checkboxDefaultState = senses.length < 2;
        this.checkboxControl.push(new FormControl(checkboxDefaultState));
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

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      this.fileToUpload = event.target.files.item(0);
      this.signFormGroup.patchValue({
        file: 'Validate form, but send file separately'
      });
    } else {
      this.fileToUpload = null;
      this.signFormGroup.patchValue({
        file: null
      });
    }
    this.cd.markForCheck();
  }

  onSearchButtonPress(searchString: string) {
    this.sensesFromApiSearchRef.setVariables({ searchString: searchString });
  }

  async onSubmit() {
    const formValue = {
      ...this.signFormGroup.value,
      senseIds: this.checkboxControl.value.filter(value => !!value)
    };
    if (this.checkboxControl.valid) {
      this.uploadStatus = UploadStatus.uploading;
      this.uploadVideoAndCreateSign(formValue);
    } else {
      console.error('formValue not valid');
    }
  }

  private async uploadVideoAndCreateSign(formValue: any) {
    const oxId = this.senses[0].oxId;

    const res: IResponse = await this.uploadService.postFile(
      this.fileToUpload,
      oxId
    );

    if (res.success) {
      this.uploadStatus = UploadStatus.creating;

      const { file, ...partialData } = formValue;

      const createSignData: CreateSignInputInterface = {
        ...partialData,
        ...{ mediaUrl: res.data.mediaUrl },
        ...{ s3Key: res.data.s3Key }
      };

      this.callCreateSignMutation(createSignData);
    } else {
      this.uploadStatus = UploadStatus.error;
    }
  }

  private callCreateSignMutation(createSignData: CreateSignInputInterface) {
    const createSignWithAssociationsMutation = gql`
      mutation createSignWithAssociationsMutation(
        $createSignData: CreateSignInput!
      ) {
        createSignWithAssociations(createSignData: $createSignData) {
          mnemonic
          mediaUrl
          s3Key
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
          this.uploadStatus = UploadStatus.success;
        },
        error => {
          this.uploadStatus = UploadStatus.error;
          throw error;
        }
      );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
