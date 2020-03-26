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
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { HydratedSense, SenseSignDtoInterface } from '@edfu/api-interfaces';
import { ApolloQueryResult } from 'apollo-client';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { SenseArrangerService } from './sense-arranger/sense-arranger.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SEARCH_COMPONENT_PATH } from '../constants';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface OxIdSearchVariables {
  searchString?: string;
}

interface OxIdsResult {
  oxIds: string[];
}

interface SenseSearchVariables {
  oxId: string;
}

interface SensesResult {
  senses: HydratedSense[];
}

interface SignSearchVariables {
  senseId: string;
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

  oxIdsSearchRef: QueryRef<OxIdsResult, OxIdSearchVariables>;
  oxIds$: Observable<string[]>;

  sensesSearchRef: QueryRef<SensesResult, SenseSearchVariables>;
  senses$: Observable<HydratedSense[]>;

  signsSearchRef: QueryRef<SignsResult, SignSearchVariables>;
  senseSigns$: Observable<SenseSignDtoInterface[]>;
  senseSignsBs$: BehaviorSubject<SenseSignDtoInterface[]>;

  selectedSense: HydratedSense;

  routeOxIdLower$: Observable<string>;
  currentOxIdLower: string;
  focusSearch = true;

  public senseCount = SenseCount.zero;

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
    this.senseSignsBs$ = new BehaviorSubject(null);

    this.searchChars$ = this.searchFormControl.valueChanges.pipe(startWith(''));

    const OxIdSearchQuery = gql`
      query OxIdSearchQuery($searchString: String! = "") {
        oxIds(searchString: $searchString, filter: true)
      }
    `;

    this.oxIdsSearchRef = this.apollo.watchQuery<
      OxIdsResult,
      OxIdSearchVariables
    >({
      query: OxIdSearchQuery
    });

    this.oxIds$ = this.oxIdsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<OxIdsResult>) => res.data.oxIds)
    );

    const EntrySensesQuery = gql`
      query EntrySensesQuery($oxId: String! = "", $senseId: String! = "") {
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
            mnemonic
            mediaUrl
            s3Key
          }
        }
      }
    `;

    // Probably better way of avoiding error on initial subscription than setting defaults which get sent to the server
    this.sensesSearchRef = this.apollo.watchQuery<
      SensesResult,
      SenseSearchVariables
    >({
      query: EntrySensesQuery
    });

    const SignsQuery = gql`
      query SignsQuery($senseId: String! = "") {
        signs(senseId: $senseId) {
          senseId
          signId
          sign {
            _id
            mnemonic
            mediaUrl
            s3Key
          }
        }
      }
    `;

    this.signsSearchRef = this.apollo.watchQuery<
      SignsResult,
      SignSearchVariables
    >({
      query: SignsQuery
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      const oxIdLower = params.get('oxIdLower');
      const senseId = params.get('senseId');
      this.currentOxIdLower = oxIdLower;
      if (oxIdLower) {
        return this.onVariablesSelectViaRouter(oxIdLower, senseId);
      }
    });

    this.senses$ = this.sensesSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<SensesResult>) => res.data.senses),
      map(senses => this.senseArranger.sortAndFilter(senses))
    );

    this.senseSigns$ = this.signsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<SignsResult>) => res.data.signs)
    );

    this.searchChars$.subscribe(input => {
      if (typeof input === 'string') {
        this.oxIdsSearchRef.setVariables({
          searchString: input
        });
      } else if (typeof input === 'object') {
        //   Do nothing
      }
    });

    this.senses$.subscribe((senses: HydratedSense[]) => {
      if (senses.length > 1) {
        this.senseCount = SenseCount.moreThanOne;
      }
      if (senses.length === 1) {
        this.senseCount = SenseCount.one;
        this.onSenseSelect(senses[0]);
      }
    });

    this.senseSigns$.subscribe(signs => {
      this.senseSignsBs$.next(signs);
    });
  }

  displayWithoutUnderscores(oxId: string): string {
    return oxId ? oxId.replace('_', ' ') : '';
  }

  onOxIdSelectViaDropdown(oxId: string) {
    const newOxIdLower = oxId.toLowerCase();
    this.router.navigate([`/${SEARCH_COMPONENT_PATH}`, newOxIdLower]);
    this.searchInput.nativeElement.blur();
    this.oxIdsSearchRef.setVariables({
      searchString: ''
    });
  }

  onVariablesSelectViaRouter(oxId: string, senseId?: string) {
    const variables = { oxId: oxId };
    if (senseId) {
      variables['senseId'] = senseId;
    }
    this.sensesSearchRef.setVariables(variables);
    this.focusSearch = false;
  }

  onSenseSelect(sense: HydratedSense, updateUrl = false) {
    if (updateUrl) {
      this.router.navigate([{ senseId: sense.senseId }], {
        relativeTo: this.route
      });
    }
    this.signsSearchRef.setVariables({
      senseId: sense.senseId
    });

    this.selectedSense = sense;
  }

  clearSearchField() {
    this.senseSignsBs$.next(null);
    this.searchFormControl.reset();
    // Needs to be cleared because otherwise valueChanges will not fire if next search is the same
    // Might be better way to clear this. Not sure if this sends request to API, or GraphQL takes care of it
    this.sensesSearchRef.setVariables({
      oxId: ''
    });
    this.signsSearchRef.setVariables({
      senseId: ''
    });
    this.selectedSense = null;
    this.searchInput.nativeElement.focus();
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
}
