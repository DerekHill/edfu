import {
  Component,
  OnInit,
  OnDestroy,
  Pipe,
  PipeTransform
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { HydratedSense, SenseSignDtoInterface } from '@edfu/api-interfaces';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ApolloQueryResult } from 'apollo-client';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { MatDialog } from '@angular/material/dialog';
import { SensesModalComponent } from './senses-modal/senses-modal.component';
import {
  UniqueEntryWithSenseGroups,
  SenseArrangerService
} from './sense-grouping/sense-arranger.service';

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

@Pipe({ name: 'removeUnderscores' })
export class RemoveUnderscoresPipe implements PipeTransform {
  transform(string: string): string {
    return string.replace('_', ' ');
  }
}

@Component({
  selector: 'edfu-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchFormControl = new FormControl();
  searchChars$: Observable<string>;

  oxIdsSearchRef: QueryRef<OxIdsResult, OxIdSearchVariables>;
  oxIds$: Observable<string[]>;
  oxId$: BehaviorSubject<string>;

  sensesSearchRef: QueryRef<SensesResult, SenseSearchVariables>;
  senses$: Observable<HydratedSense[]>;

  entriesWithSensesBs$: BehaviorSubject<UniqueEntryWithSenseGroups[]>;

  signsSearchRef: QueryRef<SignsResult, SignSearchVariables>;
  senseSigns$: Observable<SenseSignDtoInterface[]>;
  senseSignsBs$: BehaviorSubject<SenseSignDtoInterface[]>;

  constructor(
    private apollo: Apollo,
    private _hotkeysService: HotkeysService,
    private senseArranger: SenseArrangerService,
    public dialog: MatDialog
  ) {
    this._hotkeysService.add(
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
    this.searchChars$ = this.searchFormControl.valueChanges.pipe(startWith(''));

    this.entriesWithSensesBs$ = new BehaviorSubject(null);
    this.senseSignsBs$ = new BehaviorSubject(null);
    this.oxId$ = new BehaviorSubject(null);

    this.oxIdsSearchRef = this.apollo.watchQuery<
      OxIdsResult,
      OxIdSearchVariables
    >({
      query: gql`
        query OxIdSearchQuery($searchString: String! = "") {
          oxIds(searchString: $searchString, filter: true)
        }
      `
    });

    this.oxIds$ = this.oxIdsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<OxIdsResult>) => res.data.oxIds)
    );

    // Probably better way of avoiding error on initial subscription than setting defaults which get sent to the server
    this.sensesSearchRef = this.apollo.watchQuery<
      SensesResult,
      SenseSearchVariables
    >({
      query: gql`
        query EntrySensesQuery($oxId: String! = "") {
          senses(oxId: $oxId, filter: true) {
            oxId
            homographC
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
            }
          }
        }
      `
    });

    this.signsSearchRef = this.apollo.watchQuery<
      SignsResult,
      SignSearchVariables
    >({
      query: gql`
        query SignsQuery($senseId: String! = "") {
          signs(senseId: $senseId) {
            senseId
            signId
            sign {
              _id
              mnemonic
              mediaUrl
            }
          }
        }
      `
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
        //   Do nothing. Use `onGroupSelect` instead
      }
    });

    this.senses$.subscribe((senses: HydratedSense[]) => {
      if (senses.length > 1) {
        //   Show modal
        this.openDialog(senses);
        this.entriesWithSensesBs$.next(this.senseArranger.groupSenses(senses));
      }
      if (senses.length === 1) {
        this.onSenseSelect(senses[0]);
      }
      console.log('No senses found');
    });

    this.senseSigns$.subscribe(signs => {
      this.senseSignsBs$.next(signs);
    });
  }

  openDialog(senses: HydratedSense[]): void {
    const dialogRef = this.dialog.open(SensesModalComponent, {
      //   width: '250px',
      data: senses
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed with result:');
      console.log(result);
    });
  }

  displayWithoutUnderscores(oxId: string): string {
    return oxId ? oxId.replace('_', ' ') : '';
  }

  onOxIdSelect(oxId: string) {
    this.oxId$.next(oxId);
    this.sensesSearchRef.setVariables({
      oxId: oxId
    });
  }

  onSenseSelect(sense: HydratedSense) {
    this.signsSearchRef.setVariables({
      senseId: sense.senseId
    });
  }

  clearSearchField() {
    this.senseSignsBs$.next(null);
    this.searchFormControl.reset();
    // Needs to be cleared because otherwise valueChanges will not fire if next search is the same
    // Might be better way to clear this without sending request to API
    this.sensesSearchRef.setVariables({
      oxId: ''
    });
    this.signsSearchRef.setVariables({
      senseId: ''
    });
  }

  ngOnDestroy() {}
}
