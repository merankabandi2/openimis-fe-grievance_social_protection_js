/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString, formatPageQuery,
  baseApiUrl, decodeId, openBlob, formatQuery,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';
import { FETCH_INDIVIDUAL_REF } from './constants';
import { isBase64Encoded } from './utils/utils';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

const GRIEVANCE_CONFIGURATION_PROJECTION = () => [
  'grievanceTypes',
  'grievanceFlags',
  'grievanceChannels',
  'grievanceDefaultResolutionsByCategory{category, resolutionTime}',
];

const CATEGORY_FULL_PROJECTION = () => [
  'id',
  'uuid',
  'categoryTitle',
  'slug',
  'validityFrom',
  'validityTo',
];

export function fetchCategoryForPicker(mm, filters) {
  const payload = formatPageQueryWithCount('category', filters, CATEGORY_FULL_PROJECTION(mm));
  return graphql(payload, 'CATEGORY_CATEGORY');
}

export function fetchTicketSummaries(mm, filters) {
  const projections = [
    'id', 'title', 'code', 'description', 'status',
    'priority', 'dueDate', 'reporter', 'reporterId',
    'reporterType', 'reporterTypeName', 'category', 'flags',
    'channel', 'resolution', 'title', 'dateOfIncident', 'dateCreated', 'version', 'isHistory',
    'reporterName', 'isBeneficiary', 'gender', 'isBatwa', 'beneficiaryType',
    'reporterPhone', 'cniNumber', 'colline', 'gpsLocation',
    'vbgType', 'vbgDetail', 'exclusionType', 'exclusionDetail',
    'paymentType', 'paymentDetail', 'phoneType', 'phoneDetail',
    'accountType', 'accountDetail', 'receiverName', 'receiverPhone', 'receiverFunction',
    'isResolved', 'resolverName', 'resolverFunction', 'resolutionDetails',
    'otherBeneficiaryType', 'isAnonymous', 'nonBeneficiaryDetails',
    'isProjectRelated', 'violHospital', 'violComplaint', 'violSupport',
    'otherChannel', 'formId',
  ];
  const payload = formatPageQueryWithCount(
    'tickets',
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKETS');
}

export function fetchTicket(mm, filters) {
  const projections = [
    'id', 'title', 'code', 'description', 'status',
    'priority', 'dueDate', 'reporter', 'reporterId',
    'reporterType', 'reporterTypeName', 'category', 'flags', 'channel',
    'resolution', 'title', 'dateOfIncident', 'dateCreated',
    'attendingStaff {id, username}', 'version', 'isHistory,', 'jsonExt',
    'reporterName', 'isBeneficiary', 'gender', 'isBatwa', 'beneficiaryType',
    'reporterPhone', 'cniNumber', 'colline', 'gpsLocation',
    'vbgType', 'vbgDetail', 'exclusionType', 'exclusionDetail',
    'paymentType', 'paymentDetail', 'phoneType', 'phoneDetail',
    'accountType', 'accountDetail', 'receiverName', 'receiverPhone', 'receiverFunction',
    'isResolved', 'resolverName', 'resolverFunction', 'resolutionDetails',
    'otherBeneficiaryType', 'isAnonymous', 'nonBeneficiaryDetails',
    'isProjectRelated', 'violHospital', 'violComplaint', 'violSupport',
    'otherChannel', 'formId',
  ];
  const payload = formatPageQueryWithCount(
    'tickets',
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKET');
}

export function fetchComments(ticket) {
  if (ticket && ticket.id) {
    const filters = [
      `ticket_Id: "${ticket.id}"`,
      'orderBy: ["-dateCreated"]',
    ];
    const projections = [
      'id',
      'commenter',
      'commenterId',
      'commenterType',
      'commenterTypeName',
      'comment',
      'isResolution',
      'dateCreated',
      'commenterFirstName',
      'commenterLastName',
      'commenterDob',
    ];
    const payload = formatPageQueryWithCount(
      'comments',
      filters,
      projections,
    );
    return graphql(payload, 'COMMENT_COMMENTS');
  }
  return { type: 'COMMENT_COMMENTS', payload: { data: [] } };
}

// Helper function to convert arrays to space-separated strings
function arrayToSpaceSeparatedString(value) {
  if (Array.isArray(value)) {
    return value.join(' ');
  }
  return value;
}

export function formatTicketGQL(ticket) {
  return `
    ${ticket.id !== undefined && ticket.id !== null ? `id: "${ticket.id}"` : ''}
    ${ticket.code ? `code: "${formatGQLString(ticket.code)}"` : ''}
    ${!!ticket.category ? `category: "${arrayToSpaceSeparatedString(ticket.category)}"` : ''}
    ${!!ticket.title ? `title: "${ticket.title}"` : ''}
    ${!!ticket.attendingStaff && !!ticket.attendingStaff ? `attendingStaffId: "${decodeId(ticket.attendingStaff.id)}"` : ''}
    ${!!ticket.description ? `description: "${ticket.description}"` : ''}
    ${ticket.reporter
    ? (isBase64Encoded(ticket.reporter.id)
      ? `reporterId: "${decodeId(ticket.reporter.id)}"`
      : `reporterId: "${ticket.reporter.id}"`)
    : ''}
    ${!!ticket.reporterType ? `reporterType: "${ticket.reporterType}"` : ''}
    ${ticket.nameOfComplainant ? `nameOfComplainant: "${formatGQLString(ticket.nameOfComplainant)}"` : ''}
    ${ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ''}
    ${ticket.status ? `status: "${formatGQLString(ticket.status)}"` : ''}
    ${ticket.priority ? `priority: "${formatGQLString(ticket.priority)}"` : ''}
    ${ticket.dueDate ? `dueDate: "${formatGQLString(ticket.dueDate)}"` : ''}
    ${ticket.dateSubmitted ? `dateSubmitted: "${formatGQLString(ticket.dateSubmitted)}"` : ''}
    ${ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ''}
    ${!!ticket.channel ? `channel: "${arrayToSpaceSeparatedString(ticket.channel)}"` : ''}
    ${!!ticket.flags ? `flags: "${arrayToSpaceSeparatedString(ticket.flags)}"` : ''}
    ${ticket.isBeneficiary !== undefined ? `isBeneficiary: ${ticket.isBeneficiary}` : ''}
    ${ticket.gender ? `gender: "${formatGQLString(ticket.gender)}"` : ''}
    ${ticket.isBatwa !== undefined ? `isBatwa: ${ticket.isBatwa}` : ''}
    ${ticket.beneficiaryType ? `beneficiaryType: "${formatGQLString(ticket.beneficiaryType)}"` : ''}
    ${ticket.reporterPhone ? `reporterPhone: "${formatGQLString(ticket.reporterPhone)}"` : ''}
    ${ticket.reporterName ? `reporterName: "${formatGQLString(ticket.reporterName)}"` : ''}
    ${ticket.cniNumber ? `cniNumber: "${formatGQLString(ticket.cniNumber)}"` : ''}
    ${ticket.colline ? `colline: "${formatGQLString(ticket.colline)}"` : ''}
    ${ticket.gpsLocation ? `gpsLocation: "${formatGQLString(ticket.gpsLocation)}"` : ''}
    ${ticket.vbgType ? `vbgType: "${formatGQLString(ticket.vbgType)}"` : ''}
    ${ticket.vbgDetail ? `vbgDetail: "${formatGQLString(ticket.vbgDetail)}"` : ''}
    ${ticket.exclusionType ? `exclusionType: "${formatGQLString(ticket.exclusionType)}"` : ''}
    ${ticket.exclusionDetail ? `exclusionDetail: "${formatGQLString(ticket.exclusionDetail)}"` : ''}
    ${ticket.paymentType ? `paymentType: "${formatGQLString(ticket.paymentType)}"` : ''}
    ${ticket.paymentDetail ? `paymentDetail: "${formatGQLString(ticket.paymentDetail)}"` : ''}
    ${ticket.phoneType ? `phoneType: "${formatGQLString(ticket.phoneType)}"` : ''}
    ${ticket.phoneDetail ? `phoneDetail: "${formatGQLString(ticket.phoneDetail)}"` : ''}
    ${ticket.accountType ? `accountType: "${formatGQLString(ticket.accountType)}"` : ''}
    ${ticket.accountDetail ? `accountDetail: "${formatGQLString(ticket.accountDetail)}"` : ''}
    ${ticket.receiverName ? `receiverName: "${formatGQLString(ticket.receiverName)}"` : ''}
    ${ticket.receiverPhone ? `receiverPhone: "${formatGQLString(ticket.receiverPhone)}"` : ''}
    ${ticket.receiverFunction ? `receiverFunction: "${formatGQLString(ticket.receiverFunction)}"` : ''}
    ${ticket.isResolved !== undefined ? `isResolved: ${ticket.isResolved}` : ''}
    ${ticket.resolverName ? `resolverName: "${formatGQLString(ticket.resolverName)}"` : ''}
    ${ticket.resolverFunction ? `resolverFunction: "${formatGQLString(ticket.resolverFunction)}"` : ''}
    ${ticket.resolutionDetails ? `resolutionDetails: "${formatGQLString(ticket.resolutionDetails)}"` : ''}
    ${ticket.otherBeneficiaryType ? `otherBeneficiaryType: "${formatGQLString(ticket.otherBeneficiaryType)}"` : ''}
    ${ticket.isAnonymous !== undefined ? `isAnonymous: ${ticket.isAnonymous}` : ''}
    ${ticket.nonBeneficiaryDetails ? `nonBeneficiaryDetails: "${formatGQLString(ticket.nonBeneficiaryDetails)}"` : ''}
    ${ticket.isProjectRelated !== undefined ? `isProjectRelated: ${ticket.isProjectRelated}` : ''}
    ${ticket.violHospital !== undefined ? `violHospital: ${ticket.violHospital}` : ''}
    ${ticket.violComplaint !== undefined ? `violComplaint: ${ticket.violComplaint}` : ''}
    ${ticket.violSupport !== undefined ? `violSupport: ${ticket.violSupport}` : ''}
    ${ticket.otherChannel ? `otherChannel: "${formatGQLString(ticket.otherChannel)}"` : ''}
    ${ticket.formId ? `formId: "${formatGQLString(ticket.formId)}"` : ''}
  `;
}

export function formatUpdateTicketGQL(ticket) {
  // eslint-disable-next-line no-param-reassign
  if (ticket.reporter) ticket.reporter = JSON.parse(JSON.parse(ticket.reporter || '{}'), '{}');
  return `
    ${ticket.id !== undefined && ticket.id !== null ? `id: "${ticket.id}"` : ''}
    ${!!ticket.category ? `category: "${arrayToSpaceSeparatedString(ticket.category)}"` : ''}
    ${!!ticket.title ? `title: "${ticket.title}"` : ''}
    ${!!ticket.description ? `description: "${ticket.description}"` : ''}
    ${!!ticket.attendingStaff && !!ticket.attendingStaff ? `attendingStaffId: "${decodeId(ticket.attendingStaff.id)}"` : ''}
    ${ticket.reporter
    ? (isBase64Encoded(ticket.reporter.id)
      ? `reporterId: "${decodeId(ticket.reporter.id)}"`
      : `reporterId: "${ticket.reporter.id}"`)
    : ''}
    ${!!ticket.reporter && !!ticket.reporter ? `reporterType: "${ticket.reporterTypeName}"` : ''}
    ${ticket.nameOfComplainant ? `nameOfComplainant: "${formatGQLString(ticket.nameOfComplainant)}"` : ''}
    ${ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ''}
    ${ticket.status ? `status: ${formatGQLString(ticket.status)}` : ''}
    ${ticket.priority ? `priority: "${formatGQLString(ticket.priority)}"` : ''}
    ${ticket.dueDate ? `dueDate: "${formatGQLString(ticket.dueDate)}"` : ''}
    ${ticket.dateSubmitted ? `dateSubmitted: "${formatGQLString(ticket.dateSubmitted)}"` : ''}
    ${ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ''}
    ${!!ticket.channel ? `channel: "${arrayToSpaceSeparatedString(ticket.channel)}"` : ''}
    ${!!ticket.flags ? `flags: "${arrayToSpaceSeparatedString(ticket.flags)}"` : ''}
    ${ticket.isBeneficiary !== undefined ? `isBeneficiary: ${ticket.isBeneficiary}` : ''}
    ${ticket.gender ? `gender: "${formatGQLString(ticket.gender)}"` : ''}
    ${ticket.isBatwa !== undefined ? `isBatwa: ${ticket.isBatwa}` : ''}
    ${ticket.beneficiaryType ? `beneficiaryType: "${formatGQLString(ticket.beneficiaryType)}"` : ''}
    ${ticket.reporterPhone ? `reporterPhone: "${formatGQLString(ticket.reporterPhone)}"` : ''}
    ${ticket.reporterName ? `reporterName: "${formatGQLString(ticket.reporterName)}"` : ''}
    ${ticket.cniNumber ? `cniNumber: "${formatGQLString(ticket.cniNumber)}"` : ''}
    ${ticket.colline ? `colline: "${formatGQLString(ticket.colline)}"` : ''}
    ${ticket.gpsLocation ? `gpsLocation: "${formatGQLString(ticket.gpsLocation)}"` : ''}
    ${ticket.vbgType ? `vbgType: "${formatGQLString(ticket.vbgType)}"` : ''}
    ${ticket.vbgDetail ? `vbgDetail: "${formatGQLString(ticket.vbgDetail)}"` : ''}
    ${ticket.exclusionType ? `exclusionType: "${formatGQLString(ticket.exclusionType)}"` : ''}
    ${ticket.exclusionDetail ? `exclusionDetail: "${formatGQLString(ticket.exclusionDetail)}"` : ''}
    ${ticket.paymentType ? `paymentType: "${formatGQLString(ticket.paymentType)}"` : ''}
    ${ticket.paymentDetail ? `paymentDetail: "${formatGQLString(ticket.paymentDetail)}"` : ''}
    ${ticket.phoneType ? `phoneType: "${formatGQLString(ticket.phoneType)}"` : ''}
    ${ticket.phoneDetail ? `phoneDetail: "${formatGQLString(ticket.phoneDetail)}"` : ''}
    ${ticket.accountType ? `accountType: "${formatGQLString(ticket.accountType)}"` : ''}
    ${ticket.accountDetail ? `accountDetail: "${formatGQLString(ticket.accountDetail)}"` : ''}
    ${ticket.receiverName ? `receiverName: "${formatGQLString(ticket.receiverName)}"` : ''}
    ${ticket.receiverPhone ? `receiverPhone: "${formatGQLString(ticket.receiverPhone)}"` : ''}
    ${ticket.receiverFunction ? `receiverFunction: "${formatGQLString(ticket.receiverFunction)}"` : ''}
    ${ticket.isResolved !== undefined ? `isResolved: ${ticket.isResolved}` : ''}
    ${ticket.resolverName ? `resolverName: "${formatGQLString(ticket.resolverName)}"` : ''}
    ${ticket.resolverFunction ? `resolverFunction: "${formatGQLString(ticket.resolverFunction)}"` : ''}
    ${ticket.resolutionDetails ? `resolutionDetails: "${formatGQLString(ticket.resolutionDetails)}"` : ''}
    ${ticket.otherBeneficiaryType ? `otherBeneficiaryType: "${formatGQLString(ticket.otherBeneficiaryType)}"` : ''}
    ${ticket.isAnonymous !== undefined ? `isAnonymous: ${ticket.isAnonymous}` : ''}
    ${ticket.nonBeneficiaryDetails ? `nonBeneficiaryDetails: "${formatGQLString(ticket.nonBeneficiaryDetails)}"` : ''}
    ${ticket.isProjectRelated !== undefined ? `isProjectRelated: ${ticket.isProjectRelated}` : ''}
    ${ticket.violHospital !== undefined ? `violHospital: ${ticket.violHospital}` : ''}
    ${ticket.violComplaint !== undefined ? `violComplaint: ${ticket.violComplaint}` : ''}
    ${ticket.violSupport !== undefined ? `violSupport: ${ticket.violSupport}` : ''}
    ${ticket.otherChannel ? `otherChannel: "${formatGQLString(ticket.otherChannel)}"` : ''}
    ${ticket.formId ? `formId: "${formatGQLString(ticket.formId)}"` : ''}
  `;
}

export function resolveTicketGQL(ticket) {
  return `
    ${ticket.uuid !== undefined && ticket.uuid !== null ? `uuid: "${ticket.uuid}"` : ''}
    ${ticket.ticketStatus ? 'ticketStatus: "Close"' : ''}
    ${!!ticket.insuree && !!ticket.insuree.id ? `insureeUuid: "${ticket.insuree.uuid}"` : ''}
    ${!!ticket.category && !!ticket.category.id ? `categoryUuid: "${ticket.category.uuid}"` : ''}
  `;
}

export function createTicket(ticket, grievanceConfig, clientMutationLabel) {
  const resolutionTimeMap = {};
  grievanceConfig.grievanceDefaultResolutionsByCategory.forEach((item) => {
    resolutionTimeMap[item.category] = item.resolutionTime;
  });
  // eslint-disable-next-line no-param-reassign
  ticket.resolution = resolutionTimeMap[ticket.category];
  const mutation = formatMutation('createTicket', formatTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_CREATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,

  });
}

export function updateTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('updateTicket', formatUpdateTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    id: ticket.id,
  });
}

export function resolveTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('updateTicket', resolveTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    ticketUuid: ticket.uuid,
  });
}

export function fetchTicketAttachments(ticket) {
  if (ticket && ticket.uuid) {
    const payload = formatPageQuery(
      'ticketAttachments',
      [`ticket_Uuid: "${ticket.uuid}"`],
      ['id', 'uuid', 'date', 'filename', 'mimeType',
        'ticket{id, uuid, ticketCode}'],
    );
    return graphql(payload, 'TICKET_TICKET_ATTACHMENTS');
  }
  return { type: 'TICKET_TICKET_ATTACHMENTS', payload: { data: [] } };
}

export function downloadAttachment(attach) {
  const url = new URL(`${window.location.origin}${baseApiUrl}/ticket/attach`);
  url.search = new URLSearchParams({ id: decodeId(attach.id) });
  return () => fetch(url)
    .then((response) => response.blob())
    .then((blob) => openBlob(blob, attach.filename, attach.mime));
}

export function formatTicketAttachmentGQL(ticketattachment) {
  return `
    ${ticketattachment.uuid !== undefined && ticketattachment.uuid !== null ? `uuid: "${ticketattachment.uuid}"` : ''}
    ${!!ticketattachment.ticket && !!ticketattachment.ticket.id ? `ticketUuid: "${ticketattachment.ticket.uuid}"` : ''}
    ${ticketattachment.filename ? `filename: "${formatGQLString(ticketattachment.filename)}"` : ''}
    ${ticketattachment.mimeType ? `mimeType: "${formatGQLString(ticketattachment.mimeType)}"` : ''}
    ${ticketattachment.url ? `url: "${formatGQLString(ticketattachment.url)}"` : ''}
    ${ticketattachment.date ? `date: "${formatGQLString(ticketattachment.date)}"` : ''}
    ${ticketattachment.document ? `document: "${formatGQLString(ticketattachment.document)}"` : ''}
  `;
}

export function formatTicketCommentGQL(ticketComment, ticket, commenterType) {
  return `
    ${ticketComment.uuid !== undefined && ticketComment.uuid !== null ? `uuid: "${ticketComment.uuid}"` : ''}
    ${ticket.id ? `ticketId: "${ticket.id}"` : ''}
    ${ticketComment.commenter ? `commenterId: "${decodeId(ticketComment.commenter.id)}"` : ''}
    ${commenterType ? `commenterType: "${commenterType}"` : ''}
    ${ticketComment.comment ? `comment: "${formatGQLString(ticketComment.comment)}"` : ''}
  `;
}

export function createTicketAttachment(ticketattachment, clientMutationLabel) {
  const mutation = formatMutation(
    'createTicketAttachment',
    formatTicketAttachmentGQL(ticketattachment),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['TICKET_ATTACHMENT_MUTATION_REQ', 'TICKET_CREATE_TICKET_ATTACHMENT_RESP', 'TICKET_ATTACHMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function createTicketComment(ticketComment, ticket, commenterType, clientMutationLabel) {
  const mutation = formatMutation(
    'createComment',
    formatTicketCommentGQL(ticketComment, ticket, commenterType),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['TICKET_ATTACHMENT_MUTATION_REQ', 'TICKET_CREATE_TICKET_ATTACHMENT_RESP', 'TICKET_ATTACHMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function resolveGrievanceByComment(id, clientMutationLabel) {
  const mutation = formatMutation(
    'resolveGrievanceByComment',
    `id: "${id}"`,
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.RESOLVE_BY_COMMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function reopenTicket(id, clientMutationLabel) {
  const mutation = formatMutation(
    'reopenTicket',
    `id: "${id}"`,
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.REOPEN_TICKET), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function fetchIndividual(mm, id) {
  const fetchIndividualCallable = mm.getRef(FETCH_INDIVIDUAL_REF);
  return fetchIndividualCallable([`id: ${id}`]);
}

export function fetchInsureeTicket(mm, chfId) {
  const filters = [
    `chfId: "${chfId}"`,
  ];
  const projections = [
    'id', 'uuid', 'ticketTitle', 'ticketCode', 'ticketDescription',
    'name', 'phone', 'email', 'dateOfIncident', 'nameOfComplainant', 'witness',
    'resolution', 'ticketStatus', 'ticketPriority', 'dateSubmitted', 'dateSubmitted',
    'category{id, uuid, categoryTitle, slug}',
    'insuree{id, uuid, otherNames, lastName, dob, chfId, phone, email}',
    'attachment{edges{node{id, uuid, filename, mimeType, url, document, date}}}',
  ];
  const payload = formatPageQueryWithCount(
    `ticketsByInsuree(chfId: "${chfId}", orderBy: "ticketCode", ticketCode: false, first: 5)`,
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKET');
}

export function fetchGrievanceConfiguration(params) {
  const payload = formatQuery('grievanceConfig', params, GRIEVANCE_CONFIGURATION_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION);
}

export const clearTicket = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.CLEAR_TICKET),
  });
};
