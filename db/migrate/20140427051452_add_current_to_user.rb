class AddCurrentToUser < ActiveRecord::Migration
  def change
    add_column :users, :current, :float
  end
end
