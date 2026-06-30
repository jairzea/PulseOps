import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RepoIdentityService } from './repo-identity.service';
import {
  SetRepoIdentitiesDto,
  RepoProviderName,
} from './dto/repo-identity.dto';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('repo-integration')
@UseGuards(DemoOrJwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RepoIntegrationController {
  constructor(private readonly identityService: RepoIdentityService) {}

  /** Perfil de repo (identidades + scope) de una persona. */
  @Get('identities/:resourceId')
  getProfile(@Param('resourceId') resourceId: string) {
    return this.identityService.getProfile(resourceId);
  }

  /** Asocia/actualiza identidades y scope de una persona. */
  @Put('identities/:resourceId')
  setIdentities(
    @Param('resourceId') resourceId: string,
    @Body() dto: SetRepoIdentitiesDto,
  ) {
    return this.identityService.setIdentities(resourceId, dto);
  }

  /** Desasocia identidades de un proveedor (o todas si no se indica). */
  @Delete('identities/:resourceId')
  clearIdentities(
    @Param('resourceId') resourceId: string,
    @Query('provider') provider?: RepoProviderName,
  ) {
    return this.identityService.clearIdentities(resourceId, provider);
  }

  /** Sugiere matches por email entre cuentas del proveedor y personas. */
  @Post('suggest-matches')
  suggestMatches(
    @Body()
    body: {
      accounts: Array<{
        provider: RepoProviderName;
        username: string;
        email?: string;
      }>;
    },
  ) {
    return this.identityService.suggestMatches(body.accounts ?? []);
  }
}
