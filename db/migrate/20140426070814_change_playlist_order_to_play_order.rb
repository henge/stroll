class ChangePlaylistOrderToPlayOrder < ActiveRecord::Migration
  def change
    change_table :playlists do |t|
      t.rename :order, :play_order
    end
  end
end
