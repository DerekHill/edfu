// Use `query` instead of `watchQuery` because of https://github.com/apollographql/apollo-feature-requests/issues/25
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { HydratedSense, SenseSignDtoInterface } from '@edfu/api-interfaces';
import { ApolloQueryResult } from 'apollo-client';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { SenseArrangerService } from './sense-arranger/sense-arranger.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SEARCH_COMPONENT_PATH } from '../constants';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface OxIdsResult {
  oxIds: string[];
}

interface SensesResult {
  senses: HydratedSense[];
}

interface SignsResult {
  signs: SenseSignDtoInterface[];
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
  sensesBs$: BehaviorSubject<HydratedSense[]>;
  signsBs$: BehaviorSubject<SenseSignDtoInterface[]>;

  selectedSense: HydratedSense;

  routeOxIdLower$: Observable<string>;
  currentOxIdLower: string;
  focusSearch = true;

  public senseCount = SenseCount.zero;

  OxIdSearchQuery = gql`
    query OxIdSearchQuery($searchString: String! = "") {
      oxIds(searchString: $searchString, filter: true)
    }
  `;

  SensesQuery = gql`
    query SensesQuery($oxId: String! = "", $senseId: String! = "") {
      senses(oxId: $oxId, filter: true, senseId: $senseId) {
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

  SignsQuery = gql`
    query SignsQuery($senseId: String! = "") {
      signs(senseId: $senseId) {
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
  @ViewChild('search_input') searchInput: any;

  constructor(
    private apollo: Apollo,
    private hotkeysService: HotkeysService,
    private senseArranger: SenseArrangerService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
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

    this.sensesBs$.subscribe((senses: HydratedSense[]) => {
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
        query: this.SensesQuery,
        context: { method: 'GET' },
        variables: variables
      })
      .toPromise()
      .then((res: ApolloQueryResult<SensesResult>) => {
        this.sensesBs$.next(this.senseArranger.sortAndFilter(res.data.senses));
      });
  }

  onSenseSelect(sense: HydratedSense, updateUrl = false) {
    if (updateUrl) {
      this.router.navigate([{ senseId: sense.senseId }], {
        relativeTo: this.route
      });
    }

    this.apollo
      .query({
        query: this.SignsQuery,
        context: { method: 'GET' },
        variables: {
          senseId: sense.senseId
        }
      })
      .toPromise()
      .then((res: ApolloQueryResult<SignsResult>) => {
        this.signsBs$.next(this.filterOutDeletedSigns(res.data.signs));
      });

    this.selectedSense = sense;
  }

  clearSearchField() {
    this.router.navigate([`/${SEARCH_COMPONENT_PATH}`]);
  }

  ngOnDestroy() {}

  ngAfterViewInit() {
    if (this.focusSearch) {
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
