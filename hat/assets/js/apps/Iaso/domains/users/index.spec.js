import React from 'react';
import nock from 'nock';

import ConnectedUsers from './index';

import { mockGetRequestsList } from '../../../../test/utils/requests';
import { renderWithStore } from '../../../../test/utils/redux';
import { withQueryClientProvider } from '../../../../test/utils';

const requests = [
    {
        url: '/api/profiles/?order=undefined&limit=undefined&page=undefined',
        body: {
            profiles: [],
        },
    },
];

describe('Users connected component', () => {
    before(() => {
        nock.cleanAll();
        nock.abortPendingRequests();
        mockGetRequestsList(requests);
    });

    it('mount properly', () => {
        const connectedWrapper = mount(
            renderWithStore(
                withQueryClientProvider(<ConnectedUsers params={{}} />),
            ),
        );
        expect(connectedWrapper.exists()).to.equal(true);
    });

    describe('should connect to api', () => {
        it('and call forms api', () => {
            expect(nock.activeMocks()).to.have.lengthOf(0);
        });
    });
});
