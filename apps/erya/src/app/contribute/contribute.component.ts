import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import gql from 'graphql-tag';
import {
  HydratedSense,
  CreateSignInputInterface,
  IResponse,
  MAX_UPLOAD_SIZE_BYTES,
  VALID_VIDEO_FILE_REGEX,
  SUPPORTED_VIDEO_FORMATS_STRING
} from '@edfu/api-interfaces';
import { map } from 'rxjs/operators';
import { ApolloQueryResult } from 'apollo-client';
import { SenseArrangerService } from '../search/sense-arranger/sense-arranger.service';
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
import {
  faCheckCircle,
  faExclamationCircle,
  faExternalLinkAlt,
  faUpload
} from '@fortawesome/free-solid-svg-icons';

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

function fileSizeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && control.value.size > MAX_UPLOAD_SIZE_BYTES) {
      return { fileSize: { value: control.value.size } };
    } else {
      return null;
    }
  };
}

function fileTypeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && !control.value.name.match(VALID_VIDEO_FILE_REGEX)) {
      const filename = control.value.name;
      const ext = filename.split('.').pop();
      return { fileType: { value: ext } };
    } else {
      return null;
    }
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
  public maxUploadSizeFriendly = this.formatBytes(MAX_UPLOAD_SIZE_BYTES);
  public supportedVideoFormats = SUPPORTED_VIDEO_FORMATS_STRING;

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
    library.addIcons(
      faExternalLinkAlt,
      faUpload,
      faCheckCircle,
      faExclamationCircle
    );
  }

  ngOnInit() {
    this.signFormGroup = this.fb.group({
      senseIds: this.fb.array([], checkedValidator()),
      mnemonic: ['', Validators.maxLength(200)],
      file: [
        null,
        [Validators.required, fileTypeValidator(), fileSizeValidator()]
      ]
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
      const file = event.target.files.item(0);
      this.fileToUpload = file;
      this.signFormGroup.controls.file.markAsTouched();
      this.signFormGroup.patchValue({
        file: file
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
      throw new Error('formValue not valid');
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
        ...{ s3KeyOrig: res.data.s3KeyOrig }
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

  private formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
