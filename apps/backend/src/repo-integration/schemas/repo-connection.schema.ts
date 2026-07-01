import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type RepoConnectionDocument = RepoConnection & Document;

/**
 * Conexión a un proveedor de repos (modo GitHub App): guarda la INSTALACIÓN, no secretos.
 * El `installationId` no es una credencial — solo identifica dónde se instaló la App; el
 * token efímero se acuña en runtime firmando con la private key del `.env`. Por eso aquí no
 * se persiste ningún secreto (decisión acordada: "solo installationId en DB").
 */
@Schema({ collection: 'repo_connections', timestamps: true })
export class RepoConnection {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  @Prop({ required: true, default: 'github' })
  provider: 'github' | 'bitbucket';

  @Prop({ required: true })
  installationId: number;

  @Prop({ required: true })
  account: string; // login de la org/usuario donde se instaló

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  connectedBy?: string;
}

export const RepoConnectionSchema = SchemaFactory.createForClass(RepoConnection);

RepoConnectionSchema.index({ provider: 1, installationId: 1 }, { unique: true });

RepoConnectionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});
