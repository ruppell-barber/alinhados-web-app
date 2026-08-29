import { Entity } from '../../../../shared/core/domain/Entity';
import { DomainError } from '../../../../shared/core/domain/DomainError';

export interface BarbeiroDetailsProps {
  profileId: string;
  apelidoProfissional?: string;
  cpfHash?: string;
  anosExperiencia?: number;
  servicos: string[];
  cursosFormacao?: string;
  comissaoDesejada?: number;
  faturamentoMensal?: number;
  taxaOcupacao?: number;
  recordeMeta?: string;
  valores: string[];
  barbeariaAtual?: string;
  estaDesempregado?: boolean;
}

export class BarbeiroDetails extends Entity<BarbeiroDetailsProps> {
  private constructor(props: BarbeiroDetailsProps) {
    super(props, props.profileId);
    this.validate();
  }

  static create(props: BarbeiroDetailsProps): BarbeiroDetails {
    return new BarbeiroDetails({
      ...props,
      estaDesempregado: props.estaDesempregado ?? false,
      servicos: props.servicos ?? [],
      valores: props.valores ?? [],
    });
  }

  private validate(): void {
    if (!this.props.profileId || this.props.profileId.trim().length === 0) {
      throw new DomainError('O profileId é obrigatório.');
    }

    if (
      this.props.apelidoProfissional !== undefined &&
      this.props.apelidoProfissional.trim().length < 3
    ) {
      throw new DomainError('O apelido profissional deve ter no mínimo 3 caracteres.');
    }

    if (!Array.isArray(this.props.servicos)) {
      throw new DomainError('Os serviços do barbeiro são obrigatórios.');
    }

    if (this.props.servicos.length > 12) {
      throw new DomainError('É permitido no máximo 12 serviços.');
    }

    if (!Array.isArray(this.props.valores)) {
      throw new DomainError('Os valores do barbeiro são obrigatórios.');
    }

    if (this.props.valores.length > 6) {
      throw new DomainError('É permitido no máximo 6 valores/tags.');
    }

    if (this.props.anosExperiencia !== undefined && this.props.anosExperiencia < 0) {
      throw new DomainError('Os anos de experiência não podem ser negativos.');
    }

    // Comissão desejada 40–60% (RF14, Wiki §1.2); taxa de ocupação 0–100% (RF16).
    if (
      this.props.comissaoDesejada !== undefined &&
      (this.props.comissaoDesejada < 40 || this.props.comissaoDesejada > 60)
    ) {
      throw new DomainError('A comissão desejada deve estar entre 40% e 60%.');
    }

    if (
      this.props.taxaOcupacao !== undefined &&
      (this.props.taxaOcupacao < 0 || this.props.taxaOcupacao > 100)
    ) {
      throw new DomainError('A taxa de ocupação deve estar entre 0% e 100%.');
    }

    if (this.props.faturamentoMensal !== undefined && this.props.faturamentoMensal < 0) {
      throw new DomainError('O faturamento mensal não pode ser negativo.');
    }
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get apelidoProfissional(): string | undefined {
    return this.props.apelidoProfissional;
  }

  get cpfHash(): string | undefined {
    return this.props.cpfHash;
  }

  get anosExperiencia(): number | undefined {
    return this.props.anosExperiencia;
  }

  get servicos(): string[] {
    return this.props.servicos;
  }

  get cursosFormacao(): string | undefined {
    return this.props.cursosFormacao;
  }

  get comissaoDesejada(): number | undefined {
    return this.props.comissaoDesejada;
  }

  get faturamentoMensal(): number | undefined {
    return this.props.faturamentoMensal;
  }

  get taxaOcupacao(): number | undefined {
    return this.props.taxaOcupacao;
  }

  get recordeMeta(): string | undefined {
    return this.props.recordeMeta;
  }

  get valores(): string[] {
    return this.props.valores;
  }

  get barbeariaAtual(): string | undefined {
    return this.props.barbeariaAtual;
  }

  get estaDesempregado(): boolean {
    return this.props.estaDesempregado ?? false;
  }
}
