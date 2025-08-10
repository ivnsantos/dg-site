import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'

export enum TipoPlano {
  BASICO = 'BASICO',
  PRO = 'PRO',
  INATIVO = 'INATIVO'
}

export enum UserStatus {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo'
}

@Entity("users")
export class User{
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({
    length: 255,
    nullable: true,
    name: 'image_url',
  })
  imageUrl?: string;

  @Column({ nullable: true })
  telefone?: string

  @Column({ nullable: true })
  verificationCode?: boolean

  @Column({ nullable: true })
  resetPasswordToken?: string

  @Column({ unique: true })
  email!: string

  @Column()
  password!: string

  @Column({ length: 50, nullable: true })
  nivelAcesso?: string; // admin, vendedor, cozinha

  @Column({
    type: 'enum',
    enum: TipoPlano,
    default: TipoPlano.BASICO
  })
  plano!: TipoPlano;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  valorPlano!: number;

  @Column({
    length: 255,
    nullable: true,
    name: 'id_assinatura',
  })
  idAssinatura!: string;

  @Column({
    length: 255,
    nullable: true,
    name: 'id_customer',
  })
  idCustomer!: string;

  @Column({
    length: 50,
    nullable: true,
    name: 'cupom_desconto'
  })
  cupomDesconto!: string;

  @Column({
    length: 50,
    nullable: true,
    name: 'cpf_ou_cnpj',
    unique: true
  })
  cpfOuCnpj!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ATIVO,
    name: 'status'
  })
  status!: UserStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  markupIdeal?: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date

} 

// ID da conta
// 016184c3fec4e160e9b38a985a7fc4db

// Hash da conta
// ryykKupx6kiwEU8ehetgnA

// URL de entrega de imagem
// https://imagedelivery.net/ryykKupx6kiwEU8ehetgnA/<image_id>/<variant_name>