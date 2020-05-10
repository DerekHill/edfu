import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { SignDtoInterface } from '@edfu/api-interfaces';
import { ApolloQueryResult } from 'apollo-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SEARCH_COMPONENT_PATH, CONTRIBUTE_COMPONENT_PATH } from '../constants';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { ModalService } from '../shared/components/modal/modal.service';
import { AlertType } from '../alerts/alerts.typings';
import { AlertChannelService } from '../alerts/alert-channel.service';

interface SignsResult {
  signs: SignDtoInterface[];
}

const SignsQuery = gql`
  query SignsQuery {
    signs {
      _id
      senseSigns {
        senseId
        sense {
          ownEntryOxId
        }
      }
    }
  }
`;

const DeleteSignMutation = gql`
  mutation DeleteSignMutation($signId: ID!) {
    deleteSign(signId: $signId)
  }
`;

@Component({
  selector: 'edfu-manage',
  templateUrl: './manage.component.html'
})
export class ManageComponent implements OnInit {
  constructor(
    private apollo: Apollo,
    private library: FaIconLibrary,
    private modalService: ModalService,
    private alerts: AlertChannelService
  ) {
    library.addIcons(faEye, faTrashAlt);
  }

  signs$: Observable<SignDtoInterface[]>;
  signsBs$: BehaviorSubject<SignDtoInterface[]>;

  signsSearchRef: QueryRef<SignsResult, any>;

  searchComponentPath = `/${SEARCH_COMPONENT_PATH}`;
  contributeComponentPath = `/${CONTRIBUTE_COMPONENT_PATH}`;

  signToDelete: SignDtoInterface;

  ngOnInit() {
    this.signsBs$ = new BehaviorSubject([]);

    this.signsSearchRef = this.apollo.watchQuery<SignsResult, any>({
      query: SignsQuery
    });

    this.signs$ = this.signsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<SignsResult>) => res.data.signs)
    );

    this.signs$.subscribe(signs => this.signsBs$.next(signs));
  }

  onDeleteButtonClick(sign: SignDtoInterface) {
    this.openModal('delete-sign-modal');
    this.signToDelete = sign;
  }

  deleteSign() {
    this.deleteSignRemotely(this.signToDelete._id);
    this.deleteSignLocally(this.signToDelete._id);
    this.closeModal();
  }

  private deleteSignLocally(signId: string) {
    const orig = this.signsBs$.value;
    this.signsBs$.next(orig.filter(sign => sign._id != signId));
  }

  private deleteSignRemotely(signId: string) {
    this.apollo
      .mutate({
        mutation: DeleteSignMutation,
        variables: {
          signId: signId
        }
      })
      .toPromise()
      .then(res => {
        this.alerts.push({
          type: AlertType.success,
          text: `Sign deleted successfully`,
          dismissible: true
        });
        console.log(res)
      });
  }
  private openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal() {
    this.modalService.close('delete-sign-modal');
  }
}
