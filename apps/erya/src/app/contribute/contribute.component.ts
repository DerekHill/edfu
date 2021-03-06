import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import gql from 'graphql-tag';
import {
  MAX_UPLOAD_SIZE_BYTES,
  VALID_VIDEO_FILE_REGEX,
  SUPPORTED_VIDEO_FORMATS_STRING,
  SenseHydratedDtoInterface
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
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faExternalLinkAlt,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const endpoint = `${environment.apiUri}/signs`;

interface HydratedSensesLexSearchVariables {
  searchString?: string;
}

interface HydratedSensesLexResult {
  hydratedSensesLex: SenseHydratedDtoInterface[];
}

enum UploadStatus {
  none = 'none',
  uploading = 'uploading',
  creating = 'creating',
  success = 'success',
  error = 'error'
}

const HydratedSensesLexQuery = gql`
  query HydratedSensesLexQuery($searchString: String! = "") {
    hydratedSensesLex(searchString: $searchString) {
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
  @ViewChild('searchString') searchStringValue: ElementRef;
  @ViewChild('addedSign') addedSignEl: ElementRef;

  hydratedSensesSearchRef: QueryRef<
    HydratedSensesLexResult,
    HydratedSensesLexSearchVariables
  >;

  senses$: Observable<SenseHydratedDtoInterface[]>;
  senses: SenseHydratedDtoInterface[];

  public signFormGroup: FormGroup;
  public fileToUpload: File = null;
  public uploadStatus = UploadStatus.none;
  public maxUploadSizeFriendly = this.formatBytes(MAX_UPLOAD_SIZE_BYTES);
  public supportedVideoFormats = SUPPORTED_VIDEO_FORMATS_STRING;

  private checkboxControl: FormArray;

  subscription: Subscription;
  showLoader = false;
  showNotFoundMessage = false;

  uploadedSign: string;
  videoURL: SafeResourceUrl;

  constructor(
    private apollo: Apollo,
    private http: HttpClient,
    private senseArranger: SenseArrangerService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
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

    this.hydratedSensesSearchRef = this.apollo.watchQuery<
      HydratedSensesLexResult,
      HydratedSensesLexSearchVariables
    >({
      query: HydratedSensesLexQuery
    });

    this.senses$ = this.hydratedSensesSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<HydratedSensesLexResult>) => {
        this.showLoader = res.loading;
        return res.data.hydratedSensesLex;
      }),
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
      this.videoURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(file)
      );

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

  clearSearch() {
    this.showNotFoundMessage = false;
    this.hydratedSensesSearchRef.refetch({ searchString: '' });
  }

  onSearchButtonPress(searchString: string) {
    this.resetForm();
    this.uploadedSign = null;
    this.showNotFoundMessage = true;
    this.hydratedSensesSearchRef.refetch({ searchString: searchString });
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
    try {
      const formData: FormData = new FormData();
      const { file, ...partialData } = formValue;
      formData.append('file', this.fileToUpload, this.fileToUpload.name);
      formData.append('mnemonic', partialData.mnemonic);
      for (const senseId of partialData.senseIds) {
        formData.append('senseIds[]', senseId);
      }
      await this.http.post<any>(endpoint, formData).toPromise();

      this.uploadStatus = UploadStatus.success;
      this.uploadedSign = this.searchStringValue.nativeElement.value;
      this.resetInput();
      setTimeout(() => {
        this.addedSignEl.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } catch (error) {
      this.uploadStatus = UploadStatus.error;
      throw error;
    }
  }

  private formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  showMessage(searchValue) {
    return searchValue && this.showNotFoundMessage && !this.showLoader;
  }

  resetForm() {
    this.signFormGroup.reset();
    this.fileToUpload = null;
    this.uploadStatus = UploadStatus.none;
  }

  resetInput() {
    this.hydratedSensesSearchRef.refetch({ searchString: '' });
    this.searchStringValue.nativeElement.value = '';
  }

  resetStates() {
    this.resetForm();
    this.resetInput();
    this.uploadedSign = null;
    this.searchStringValue.nativeElement.focus();
    this.showNotFoundMessage = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
