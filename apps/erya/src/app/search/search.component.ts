// Use `query` instead of `watchQuery` because of https://github.com/apollographql/apollo-feature-requests/issues/25
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import {
  SenseHydratedDtoInterface,
  SenseSignDtoInterface
} from '@edfu/api-interfaces';
import { ApolloQueryResult } from 'apollo-client';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { SenseArrangerService } from './sense-arranger/sense-arranger.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SEARCH_COMPONENT_PATH } from '../constants';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { DeviceDetectorService } from 'ngx-device-detector';

interface OxIdsResult {
  oxIds: string[];
}

interface SensesResult {
  hydratedSensesExisting: SenseHydratedDtoInterface[];
}

interface SenseSignsResult {
  senseSigns: SenseSignDtoInterface[];
}

enum SenseCount {
  zero = 'zero',
  one = 'one',
  moreThanOne = 'moreThanOne'
}

@Component({
  selector: 'edfu-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  searchFormControl = new FormControl();
  searchChars$: Observable<string>;

  oxIdsBs$: BehaviorSubject<string[]>;
  sensesBs$: BehaviorSubject<SenseHydratedDtoInterface[]>;
  signsBs$: BehaviorSubject<SenseSignDtoInterface[]>;

  selectedSense: SenseHydratedDtoInterface;
  explicitlySelectedSense: SenseHydratedDtoInterface;

  routeOxIdLower$: Observable<string>;
  currentOxIdLower: string;
  focusSearch = true;

  public senseCount = SenseCount.zero;

  OxIdSearchQuery = gql`
    query OxIdSearchQuery($searchString: String! = "") {
      oxIds(searchString: $searchString, filter: true)
    }
  `;

  HydratedSensesRefQuery = gql`
    query HydratedSensesRefQuery($oxId: String! = "", $senseId: String! = "") {
      hydratedSensesExisting(oxId: $oxId, filter: true, senseId: $senseId) {
        oxId
        homographC
        ownEntryOxId
        senseId
        lexicalCategory
        apiSenseIndex
        example
        definition
        associationType
        similarity
        signs {
          _id
        }
      }
    }
  `;

  SenseSignsQuery = gql`
    query SenseSignsQuery($senseId: String! = "") {
      senseSigns(senseId: $senseId) {
        senseId
        signId
        sign {
          _id
          mnemonic
          s3KeyOrig
          transcodings {
            s3Key
            size
          }
        }
      }
    }
  `;
  @ViewChild('search_input') searchInput: ElementRef;

  constructor(
    private apollo: Apollo,
    private hotkeysService: HotkeysService,
    private senseArranger: SenseArrangerService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private deviceService: DeviceDetectorService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faSearch);
    this.hotkeysService.add(
      new Hotkey(
        'esc',
        (event: KeyboardEvent): boolean => {
          this.clearSearchField();
          return false;
        },
        ['INPUT', 'SELECT', 'TEXTAREA']
      )
    );
  }

  ngOnInit() {
    this.oxIdsBs$ = new BehaviorSubject([]);
    this.sensesBs$ = new BehaviorSubject([]);
    this.signsBs$ = new BehaviorSubject([]);

    this.searchChars$ = this.searchFormControl.valueChanges.pipe(startWith(''));

    this.route.paramMap.subscribe((params: ParamMap) => {
      const oxIdLower = params.get('oxIdLower');
      const senseId = params.get('senseId');
      this.currentOxIdLower = oxIdLower;
      if (oxIdLower) {
        return this.onVariablesSelectViaRouter(oxIdLower, senseId);
      }
    });

    this.searchChars$.subscribe(input => {
      this.apollo
        .query({
          query: this.OxIdSearchQuery,
          context: { method: 'GET' },
          variables: { searchString: input }
        })
        .toPromise()
        .then((res: ApolloQueryResult<OxIdsResult>) => {
          this.oxIdsBs$.next(res.data.oxIds);
        });
    });

    this.sensesBs$.subscribe((senses: SenseHydratedDtoInterface[]) => {
      if (senses.length > 1) {
        this.senseCount = SenseCount.moreThanOne;
      }
      if (senses.length === 1) {
        this.senseCount = SenseCount.one;
        this.onSenseSelect(senses[0]);
      }
    });
  }

  displayWithoutUnderscores(oxId: string): string {
    return oxId ? oxId.replace('_', ' ') : '';
  }

  onOxIdSelectViaDropdown(oxId: string) {
    const newOxIdLower = oxId.toLowerCase();
    this.router.navigate([`/${SEARCH_COMPONENT_PATH}`, newOxIdLower]);
    this.searchInput.nativeElement.blur();
  }

  onVariablesSelectViaRouter(oxId: string, senseId?: string) {
    this.focusSearch = false;
    const variables = { oxId: oxId };
    if (senseId) {
      variables['senseId'] = senseId;
    }
    this.apollo
      .query({
        query: this.HydratedSensesRefQuery,
        context: { method: 'GET' },
        variables: variables
      })
      .toPromise()
      .then((res: ApolloQueryResult<SensesResult>) => {
        this.sensesBs$.next(
          this.senseArranger.sortAndFilter(res.data.hydratedSensesExisting)
        );
      });
  }

  onSenseSelect(
    sense: SenseHydratedDtoInterface,
    senseExplicitySelected = false
  ) {
    this.selectedSense = sense;

    if (senseExplicitySelected) {
      this.explicitlySelectedSense = sense;
      this.router.navigate([{ senseId: sense.senseId }], {
        relativeTo: this.route
      });
    }

    this.apollo
      .query({
        query: this.SenseSignsQuery,
        context: { method: 'GET' },
        variables: {
          senseId: sense.senseId
        }
      })
      .toPromise()
      .then((res: ApolloQueryResult<SenseSignsResult>) => {
        this.signsBs$.next(this.filterOutDeletedSigns(res.data.senseSigns));
      });
  }

  clearSearchField() {
    this.searchFormControl.setValue('');
    this.router.navigate([`/${SEARCH_COMPONENT_PATH}`]);
  }

  ngOnDestroy() {}

  ngAfterViewInit() {
    if (this.focusSearch && this.deviceService.isDesktop()) {
      this.searchInput.nativeElement.focus();
      this.cd.detectChanges();
    } else {
      this.searchInput.nativeElement.blur();
      this.cd.detectChanges();
    }
  }

  private filterOutDeletedSigns(
    senseSigns: SenseSignDtoInterface[]
  ): SenseSignDtoInterface[] {
    return senseSigns.filter(senseSign => senseSign.sign);
  }
}
