export * from './registry/openApi';

export * from './schemas/PaginationSchema';
export * from './schemas/UserCreateSchema';
export {
  ResponseMetaSchema,
  ErrorResponseSchema,
  ValidationErrorResponseSchema,
  successEnvelope,
  successResponse,
  errorResponse,
  validationErrorResponse,
} from './schemas/appResponse';

// Discovery
export * from './schemas/FeedSchema';
export * from './schemas/FeedBarbeiroSchema';
export * from './schemas/FeedBarbeariaSchema';
export * from './schemas/PerfilBarbeiroSchema';
export * from './schemas/PerfilBarbeariaSchema';
export * from './schemas/SwipeSchema';

// Identidade
export * from './schemas/CadastroSchema';
export * from './schemas/LoginSchema';
export * from './schemas/LogoutSchema';
export * from './schemas/RefreshSchema';
export * from './schemas/RecuperarSenhaSchema';
export * from './schemas/RedefinirSenhaSchema';
export * from './schemas/AlterarSenhaSchema';

// Perfil
export * from './schemas/PerfilCommonSchema';
export * from './schemas/UpdatePerfilSchema';
export * from './schemas/GetPerfilSchema';
export * from './schemas/CreateBarbeariaDetailsSchema';
export * from './schemas/CreateBarbeiroDetailsSchema';
export * from './schemas/UpdateHiringStatusSchema';
export * from './schemas/UploadPhotoSchema';
export * from './schemas/ListPhotosSchema';
export * from './schemas/DeletePhotoSchema';
