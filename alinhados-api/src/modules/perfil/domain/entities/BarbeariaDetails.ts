import { Entity } from '../../../../shared/core/domain/Entity';
import { DomainError } from '../../../../shared/core/domain/DomainError';

export interface BarbeariaDetailsProps {
  profileId: string;
  nomeDecisor?: string;
  cnpjHash?: string;
  numCadeiras?: number;
  vagasAbertas?: number;
  comissaoPaga?: number;
  temFixo?: boolean;
  valorFixo?: number;
  temClube?: boolean;
  descricaoClube?: string;
  temPops?: boolean;
  numUnidades?: number;
  eFranquia?: boolean;
  faturamentoMedio?: number;
  valores: string[];
  estaContratando?: boolean;
}

export class BarbeariaDetails extends Entity<BarbeariaDetailsProps> {
  private constructor(props: BarbeariaDetailsProps) {
    super(props, props.profileId);
    this.validate();
  }

  static create(props: BarbeariaDetailsProps): BarbeariaDetails {
    return new BarbeariaDetails({
      ...props,
      temFixo: props.temFixo ?? false,
      temClube: props.temClube ?? false,
      temPops: props.temPops ?? false,
      eFranquia: props.eFranquia ?? false,
      estaContratando: props.estaContratando ?? true,
      vagasAbertas: props.vagasAbertas ?? 0,
      numUnidades: props.numUnidades ?? 1,
      valores: props.valores ?? [],
    });
  }

  private validate(): void {
    if (!this.props.profileId || this.props.profileId.trim().length === 0) {
      throw new DomainError('O profileId é obrigatório.');
    }

    if (this.props.nomeDecisor !== undefined && this.props.nomeDecisor.trim().length < 3) {
      throw new DomainError('O nome do decisor deve ter no mínimo 3 caracteres.');
    }

    if (!Array.isArray(this.props.valores)) {
      throw new DomainError('Os valores da barbearia são obrigatórios.');
    }

    if (this.props.valores.length > 6) {
      throw new DomainError('É permitido no máximo 6 valores/tags.');
    }

    if (this.props.numCadeiras !== undefined && this.props.numCadeiras < 0) {
      throw new DomainError('O número de cadeiras não pode ser negativo.');
    }

    if (this.props.vagasAbertas !== undefined && this.props.vagasAbertas < 0) {
      throw new DomainError('O número de vagas abertas não pode ser negativo.');
    }

    if (
      this.props.comissaoPaga !== undefined &&
      (this.props.comissaoPaga < 40 || this.props.comissaoPaga > 60)
    ) {
      throw new DomainError('A comissão paga deve estar entre 40% e 60%.');
    }

    if (this.props.temFixo && (this.props.valorFixo === undefined || this.props.valorFixo <= 0)) {
      throw new DomainError(
        'O valor do fixo de segurança é obrigatório quando o fixo está ativado.'
      );
    }

    if (this.props.numUnidades !== undefined && this.props.numUnidades < 1) {
      throw new DomainError('O número de unidades deve ser no mínimo 1.');
    }
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get nomeDecisor(): string | undefined {
    return this.props.nomeDecisor;
  }

  get cnpjHash(): string | undefined {
    return this.props.cnpjHash;
  }

  get numCadeiras(): number | undefined {
    return this.props.numCadeiras;
  }

  get vagasAbertas(): number {
    return this.props.vagasAbertas ?? 0;
  }

  get comissaoPaga(): number | undefined {
    return this.props.comissaoPaga;
  }

  get temFixo(): boolean {
    return this.props.temFixo ?? false;
  }

  get valorFixo(): number | undefined {
    return this.props.valorFixo;
  }

  get temClube(): boolean {
    return this.props.temClube ?? false;
  }

  get descricaoClube(): string | undefined {
    return this.props.descricaoClube;
  }

  get temPops(): boolean {
    return this.props.temPops ?? false;
  }

  get numUnidades(): number {
    return this.props.numUnidades ?? 1;
  }

  get eFranquia(): boolean {
    return this.props.eFranquia ?? false;
  }

  get faturamentoMedio(): number | undefined {
    return this.props.faturamentoMedio;
  }

  get valores(): string[] {
    return this.props.valores;
  }

  get estaContratando(): boolean {
    return this.props.estaContratando ?? true;
  }

  public pauseHiring(): void {
    this.props.estaContratando = false;
  }

  public resumeHiring(): void {
    this.props.estaContratando = true;
  }
}
