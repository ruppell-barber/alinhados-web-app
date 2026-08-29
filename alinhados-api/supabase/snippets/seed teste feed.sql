-- Viewer (barbeiro): precisa de estado/cidade p/ o filtro geográfico
UPDATE profiles
SET user_type = 'barbeiro', cidade = 'São Paulo', estado = 'SP'
WHERE id = 'fe1b6a59-1d10-4b03-bc70-580abd77e5c6';

-- Candidato (barbearia): completo + aberto + mesmo estado
UPDATE profiles
SET user_type = 'barbearia', is_complete = true, status = 'aberto',
    nome = 'Barbearia do Zé', cidade = 'São Paulo', estado = 'SP',
    avatar_url = 'https://example.com/logo.jpg'
WHERE id = '10f6a375-73e1-4fbb-9ec2-31262406c581';

INSERT INTO barbearia_details (profile_id, num_cadeiras, comissao_paga, tem_fixo, valor_fixo, valores)
VALUES ('10f6a375-73e1-4fbb-9ec2-31262406c581', 4, 50, true, 1500.00,
        ARRAY['pontualidade','ambiente familiar'])
ON CONFLICT (profile_id) DO UPDATE
SET num_cadeiras = EXCLUDED.num_cadeiras, comissao_paga = EXCLUDED.comissao_paga,
    tem_fixo = EXCLUDED.tem_fixo, valor_fixo = EXCLUDED.valor_fixo, valores = EXCLUDED.valores;

-- Garante que o barbeiro ainda não avaliou a barbearia (senão o feed exclui)
DELETE FROM swipes
WHERE swiper_id = 'fe1b6a59-1d10-4b03-bc70-580abd77e5c6'
  AND swiped_id = '10f6a375-73e1-4fbb-9ec2-31262406c581';